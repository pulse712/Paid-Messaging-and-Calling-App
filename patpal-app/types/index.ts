export type UserRole = "client" | "patpal" | "admin";

export type AvailabilityStatus = "available" | "busy" | "offline";

export interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  isActive: boolean;
  stripeCustomerId?: string;
  hasActiveSubscription?: boolean;
}

export interface PatPalProfile extends UserProfile {
  role: "patpal";
  availability: AvailabilityStatus;
  specialties?: string[];
  sessionCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  clientId: string;
  patPalId: string;
  clientName: string;
  patPalName: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface CallSession {
  id: string;
  chatId: string;
  clientId: string;
  patPalId: string;
  type: "audio" | "video";
  status: "active" | "ended";
  startedAt: Date;
  endedAt?: Date;
  agoraChannel: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: "active" | "canceled" | "past_due";
  planName: string;
  amount: number;
  currency: string;
  currentPeriodEnd: Date;
  createdAt: Date;
}
