import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demoProfile, isDemoMode } from "@/lib/demo";
import type { Profile, Role } from "@/lib/types";

export async function getSessionProfile() {
  if (isDemoMode()) {
    return { user: { id: demoProfile.id, email: demoProfile.email }, profile: demoProfile };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, email")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireUser() {
  const session = await getSessionProfile();
  if (!session.user) redirect("/login");
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireUser();
  if (!session.profile || !roles.includes(session.profile.role)) redirect("/dashboard");
  return session;
}
