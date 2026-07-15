// Demo mode auth — bypasses Firebase when credentials are not configured
// Remove this file and update auth pages when real Firebase keys are added

export const DEMO_MODE =
  typeof window !== "undefined"
    ? !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key" ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder"
    : true;

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  role: "client" | "patpal" | "admin";
  hasActiveSubscription: boolean;
  availability?: string;
  bio?: string;
  isActive: boolean;
  phone: string;
}

const DEMO_USERS_KEY = "patpal_demo_users";
const DEMO_SESSION_KEY = "patpal_demo_session";

export const getDemoUsers = (): Record<string, DemoUser> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveDemoUsers = (users: Record<string, DemoUser>) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

export const getDemoSession = (): DemoUser | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DEMO_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveDemoSession = (user: DemoUser | null) => {
  if (user) {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }
};

export const demoRegister = (
  email: string,
  password: string,
  displayName: string,
  role: "client" | "patpal",
  phone: string,
  bio?: string
): DemoUser => {
  const users = getDemoUsers();
  const uid = `demo_${Date.now()}`;
  const user: DemoUser = {
    uid,
    email,
    displayName,
    role,
    hasActiveSubscription: false,
    availability: role === "patpal" ? "available" : undefined,
    bio: bio || "",
    isActive: true,
    phone,
  };
  users[email] = user;
  saveDemoUsers(users);
  saveDemoSession(user);
  return user;
};

export const demoLogin = (email: string, password: string): DemoUser => {
  const users = getDemoUsers();

  // Auto-create admin account
  if (email === "admin@demo.com") {
    const admin: DemoUser = {
      uid: "demo_admin",
      email,
      displayName: "Admin",
      role: "admin",
      hasActiveSubscription: true,
      isActive: true,
      phone: "0000000000",
    };
    saveDemoSession(admin);
    return admin;
  }

  const user = users[email];
  if (!user) throw new Error("No account found. Please sign up first.");
  saveDemoSession(user);
  return user;
};

export const demoSignOut = () => {
  saveDemoSession(null);
};
