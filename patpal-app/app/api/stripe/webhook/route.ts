import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId && adminDb) {
          await adminDb.collection("users").doc(userId).update({
            hasActiveSubscription: true,
            stripeCustomerId: session.customer,
          });
          await adminDb.collection("subscriptions").add({
            userId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            status: "active",
            planName: "PatPal Monthly",
            amount: 2900,
            currency: "usd",
            createdAt: new Date(),
          });
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === "active";

        if (!adminDb) break;

        const usersSnap = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .get();

        for (const userDoc of usersSnap.docs) {
          await userDoc.ref.update({ hasActiveSubscription: isActive });
        }

        await adminDb
          .collection("subscriptions")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get()
          .then((snap) =>
            snap.docs.forEach((d) => d.ref.update({ status: subscription.status }))
          );
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
