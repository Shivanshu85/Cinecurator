import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function createDemoUser(email: string, name?: string): User {
  return {
    id: "user_" + Math.random().toString(36).substring(2, 9),
    app_metadata: { provider: "email" },
    user_metadata: { full_name: name || email.split("@")[0] },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: email,
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  } as User;
}

export function setLocalSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cinecurator_session", JSON.stringify({ user }));
    document.cookie = `cinecurator_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
    window.dispatchEvent(new Event("cinecurator_auth_change"));
  }
}

export function getLocalSession(): User | null {
  if (typeof window === "undefined") return null;
  const str = localStorage.getItem("cinecurator_session");
  if (!str) return null;
  try {
    const data = JSON.parse(str);
    return data.user || null;
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cinecurator_session");
    document.cookie = "cinecurator_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.dispatchEvent(new Event("cinecurator_auth_change"));
  }
}

/** Check if Supabase endpoint domain actually resolves / is reachable */
export async function isSupabaseReachable(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("placeholder") || url.includes("your-project")) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}
