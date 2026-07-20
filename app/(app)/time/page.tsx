import { Clock, PauseCircle, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoJobs, demoWorkSessions, isDemoMode } from "@/lib/demo";
import { finishWorkSession, startWorkSession } from "@/lib/actions/crud";
import { Button } from "@/components/ui/button";
import { Select, TextArea } from "@/components/ui/input";
import { PageTitle, StatCard } from "@/components/shell";
import { minutesToHours, todayISO } from "@/lib/utils";

export default async function TimePage() {
  const { profile } = await requireUser();
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: sessions }, { data: jobs }] = demo ? [
    { data: demoWorkSessions },
    { data: demoJobs.filter((job) => ["programado", "en_camino", "en_proceso", "pausado"].includes(job.status)) }
  ] : await Promise.all([
    supabase!.from("work_sessions").select("id, started_at, ended_at, total_minutes, approval_status, jobs(name)").eq("user_id", profile?.id).order("started_at", { ascending: false }).limit(20),
    supabase!.from("jobs").select("id, name").in("status", ["programado", "en_camino", "en_proceso", "pausado"]).order("scheduled_date", { ascending: true }).limit(20)
  ]);
  const sessionRows = (sessions ?? []) as any[];
  const activeSession = sessionRows.find((row) => !row.ended_at);
  const todayMinutes = sessionRows.filter((row) => row.started_at?.startsWith(todayISO())).reduce((sum, row) => sum + (row.total_minutes ?? 0), 0);

  return (
    <div>
      <PageTitle title="Control horario" subtitle="Inicio, fin de jornada, pausas y aprobacion administrativa." />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Hoy" value={`${minutesToHours(todayMinutes)} h`} />
        <StatCard label="Estado" value={activeSession ? "Activo" : "Libre"} tone={activeSession ? "copper" : "white"} />
      </div>
      <section className="glass mb-5 rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2">
          {activeSession ? <PauseCircle className="text-copper" /> : <PlayCircle className="text-mint" />}
          <h3 className="text-lg font-bold">{activeSession ? "Jornada en curso" : "Iniciar jornada"}</h3>
        </div>
        <form action={activeSession ? finishWorkSession : startWorkSession} className="grid gap-4">
          {activeSession ? <input type="hidden" name="session_id" value={activeSession.id} /> : (
            <>
              <Select label="Trabajo relacionado" name="job_id">
                <option value="">Sin trabajo</option>
                {(jobs ?? []).map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
              </Select>
              <TextArea label="Observaciones" name="notes" />
            </>
          )}
          <Button variant={activeSession ? "danger" : "primary"}>{activeSession ? "Finalizar jornada" : "Iniciar jornada"}</Button>
        </form>
      </section>
      <div className="grid gap-3">
        {sessionRows.map((session) => (
          <article key={session.id} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{Array.isArray(session.jobs) ? session.jobs[0]?.name : session.jobs?.name ?? "Jornada general"}</p>
                <p className="text-xs text-white/55">{new Date(session.started_at).toLocaleString("es-UY")}</p>
              </div>
              <div className="text-right">
                <Clock className="ml-auto text-mint" size={18} />
                <p className="text-sm">{session.ended_at ? `${minutesToHours(session.total_minutes)} h` : "Activa"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
