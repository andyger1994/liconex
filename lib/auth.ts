import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, email")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const service = createServiceClient();
  if (service && (!profile || (user.email === "admin@liconex.local" && profile.role !== "admin"))) {
    const role = user.email === "admin@liconex.local" ? "admin" : "technician";
    const { data } = await service
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Usuario",
        role
      })
      .select("id, full_name, role, email")
      .single<Profile>();
    profile = data ?? profile;
  }

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
