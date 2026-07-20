import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, CirclePlus, Home, MoreHorizontal, ReceiptText } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/jobs", label: "Trabajos", icon: BriefcaseBusiness },
  { href: "/jobs?new=1", label: "Crear", icon: CirclePlus, raised: true },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  { href: "/reports", label: "Mas", icon: MoreHorizontal }
];

export function AppShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md safe-bottom">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Liconex</p>
            <h1 className="text-lg font-semibold">{profile?.full_name ?? "Panel operativo"}</h1>
          </div>
          <form action={signOut}>
            <Button variant="ghost" className="min-h-10 px-2 text-xs">
              Salir
            </Button>
          </form>
        </div>
      </header>
      <main className="px-5 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/12 bg-ink/88 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="grid grid-cols-5 items-end gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="grid justify-items-center gap-1 text-[11px] text-white/68">
                <span className={item.raised ? "grid h-14 w-14 -translate-y-4 place-items-center rounded-full bg-mint text-ink shadow-lg shadow-mint/25" : "grid h-9 w-9 place-items-center rounded-xl"}>
                  <Icon size={item.raised ? 28 : 21} />
                </span>
                <span className={item.raised ? "-mt-4" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-white/62">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, tone = "mint" }: { label: string; value: string | number; tone?: "mint" | "copper" | "white" }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-white/58">{label}</p>
      <p className={tone === "mint" ? "mt-1 text-2xl font-bold text-mint" : tone === "copper" ? "mt-1 text-2xl font-bold text-copper" : "mt-1 text-2xl font-bold text-white"}>{value}</p>
    </div>
  );
}
