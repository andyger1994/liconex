import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return <AppShell profile={profile}>{children}</AppShell>;
}
