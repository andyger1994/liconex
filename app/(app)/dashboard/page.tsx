import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Banknote, BriefcaseBusiness, Clock3, Plus, ReceiptText, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PageTitle, StatCard } from "@/components/shell";
import { finishWorkSession, startWorkSession } from "@/lib/actions/crud";
import { minutesToHours, money, todayISO } from "@/lib/utils";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const today = todayISO();
  const supabase = await createClient();

  const [jobs, expenses, payments, sessions] = await Promise.all([
    supabase.from("jobs").select("id, name, status, scheduled_date, address").order("scheduled_date", { ascending: true }).limit(8),
    supabase.from("expenses").select("amount, currency, spent_at").gte("spent_at", today),
    supabase.from("payments").select("amount, currency, paid_at").gte("paid_at", today),
    supabase.from("work_sessions").select("id, started_at, ended_at, total_minutes, job_id").eq("user_id", profile?.id).gte("started_at", today).order("started_at", { ascending: false })
  ]);

  const activeSession = sessions.data?.find((row) => !row.ended_at);
  const hoursToday = minutesToHours(sessions.data?.reduce((sum, row) => sum + (row.total_minutes ?? 0), 0));
  const pendingJobs = jobs.data?.filter((job) => ["nuevo", "programado", "pendiente_materiales", "pendiente_cliente"].includes(job.status)).length ?? 0;
  const activeJobs = jobs.data?.filter((job) => ["en_camino", "en_proceso", "pausado"].includes(job.status)).length ?? 0;
  const finishedJobs = jobs.data?.filter((job) => ["finalizado", "facturado", "cobrado"].includes(job.status)).length ?? 0;
  const expensesToday = expenses.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;
  const paymentsToday = payments.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

  return (
    <div>
      <PageTitle title={`Hola, ${profile?.full_name?.split(" ")[0] ?? "equipo"}`} subtitle={new Intl.DateTimeFormat("es-UY", { dateStyle: "full" }).format(new Date())} />
      <section className="glass mb-5 rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/58">Trabajo activo</p>
            <h3 className="mt-1 text-xl font-bold">{activeSession ? "Jornada en curso" : "Sin jornada activa"}</h3>
          </div>
          <Clock3 className="text-mint" />
        </div>
        <form action={activeSession ? finishWorkSession : startWorkSession} className="mt-5">
          {activeSession ? <input type="hidden" name="session_id" value={activeSession.id} /> : null}
          <Button className="w-full min-h-16 text-base" variant={activeSession ? "danger" : "primary"}>
            {activeSession ? "Finalizar jornada" : "Iniciar jornada"}
          </Button>
        </form>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Horas hoy" value={`${hoursToday} h`} />
        <StatCard label="Pendientes" value={pendingJobs} tone="copper" />
        <StatCard label="En proceso" value={activeJobs} />
        <StatCard label="Finalizados" value={finishedJobs} tone="white" />
        <StatCard label="Gastos hoy" value={money(expensesToday)} tone="copper" />
        <StatCard label="Cobros hoy" value={money(paymentsToday)} />
      </section>

      <section className="mb-5">
        <h3 className="mb-3 text-sm font-semibold text-white/72">Accesos rapidos</h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            ["/jobs?new=1", "Trabajo", Plus],
            ["/expenses?new=1", "Gasto", ReceiptText],
            ["/reports?payment=1", "Cobro", Banknote],
            ["/time", "Jornada", Clock3],
            ["/clients?new=1", "Cliente", UserPlus],
            ["/calendar", "Calendario", BriefcaseBusiness]
          ] as [string, string, LucideIcon][]).map(([href, label, Icon]) => (
            <Link key={String(href)} href={String(href)} className="glass grid min-h-24 place-items-center rounded-2xl p-3 text-center text-sm font-semibold">
              <Icon className="mb-2 text-mint" />
              {String(label)}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center gap-2 text-copper">
          <AlertTriangle size={18} />
          <h3 className="font-semibold">Alertas importantes</h3>
        </div>
        <div className="grid gap-3">
          {(jobs.data ?? []).slice(0, 4).map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="rounded-2xl bg-white/8 p-3">
              <p className="font-medium">{job.name}</p>
              <p className="text-xs text-white/55">{job.address}</p>
            </Link>
          ))}
          {!jobs.data?.length ? <p className="text-sm text-white/55">Sin trabajos proximos. Crea el primero desde el boton central.</p> : null}
        </div>
      </section>
    </div>
  );
}
