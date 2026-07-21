import Link from "next/link";
import { CalendarDays, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/shell";

export default async function CalendarPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, name, status, scheduled_date, scheduled_time, due_date, warranty_until, next_maintenance, address")
    .or("scheduled_date.not.is.null,due_date.not.is.null,warranty_until.not.is.null,next_maintenance.not.is.null")
    .order("scheduled_date", { ascending: true })
    .limit(60);

  const events = (jobs ?? []).flatMap((job) => [
    job.scheduled_date ? { id: `${job.id}-scheduled`, date: job.scheduled_date, time: job.scheduled_time, title: job.name, subtitle: job.address, icon: CalendarDays, tone: "text-mint" } : null,
    job.due_date ? { id: `${job.id}-due`, date: job.due_date, title: `Vence: ${job.name}`, subtitle: job.status, icon: Clock3, tone: "text-copper" } : null,
    job.warranty_until ? { id: `${job.id}-warranty`, date: job.warranty_until, title: `Garantia: ${job.name}`, subtitle: "Proxima a vencer", icon: ShieldCheck, tone: "text-mint" } : null,
    job.next_maintenance ? { id: `${job.id}-maintenance`, date: job.next_maintenance, title: `Mantenimiento: ${job.name}`, subtitle: job.address, icon: Wrench, tone: "text-copper" } : null
  ].filter(Boolean)).sort((a, b) => String(a?.date).localeCompare(String(b?.date)));

  return (
    <div>
      <PageTitle title="Agenda" subtitle="Trabajos, vencimientos, garantias y mantenimientos futuros." />
      <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
        {["Dia", "Semana", "Mes", "Lista"].map((view, index) => (
          <span key={view} className={index === 3 ? "rounded-2xl bg-mint px-3 py-3 font-semibold text-ink" : "rounded-2xl bg-white/8 px-3 py-3 text-white/70"}>{view}</span>
        ))}
      </div>
      <div className="grid gap-3">
        {events.map((event) => {
          if (!event) return null;
          const Icon = event.icon;
          return (
            <Link href={`/jobs/${String(event.id).split("-").slice(0, 5).join("-")}`} key={event.id} className="glass flex items-center gap-4 rounded-3xl p-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                <Icon className={event.tone} />
              </div>
              <div>
                <p className="text-sm text-white/55">{new Date(`${event.date}T00:00:00`).toLocaleDateString("es-UY", { weekday: "short", day: "2-digit", month: "short" })} {event.time ?? ""}</p>
                <h3 className="font-bold">{event.title}</h3>
                <p className="text-xs text-white/50">{event.subtitle}</p>
              </div>
            </Link>
          );
        })}
        {!events.length ? <p className="glass rounded-3xl p-5 text-sm text-white/62">No hay eventos programados todavia.</p> : null}
      </div>
    </div>
  );
}
