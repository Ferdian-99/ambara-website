import type { Session, User } from "@supabase/supabase-js";
import { isUserRole, type UserRole } from "./rbac";
import { supabase, type Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
};

export async function getCurrentAuthState(): Promise<AuthState> {
  if (!supabase) return { session: null, user: null, profile: null };

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const user = session?.user ?? null;

  if (!user) return { session, user, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return { session, user, profile: profile ?? null };
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return { error: new Error("Supabase belum dikonfigurasi.") };
  }

  return supabase.auth.signInWithPassword({ email, password });
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  if (!supabase) {
    return { error: new Error("Supabase belum dikonfigurasi.") };
  }

  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(password: string) {
  if (!supabase) {
    return { error: new Error("Supabase belum dikonfigurasi.") };
  }

  return supabase.auth.updateUser({ password });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function getProfileRole(profile: Profile | null): UserRole | null {
  return isUserRole(profile?.role) ? profile.role : null;
}
