import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    const stripe = getStripeServer();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      metadata: { userId },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PatPal Monthly Access",
              description: "Unlimited text, audio, and video with Pat Pals",
            },
            unit_amount: 2900,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
