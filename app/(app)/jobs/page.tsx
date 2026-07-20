import Link from "next/link";
import { MapPin, Timer, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoClients, demoJobs, isDemoMode } from "@/lib/demo";
import { PageTitle } from "@/components/shell";
import { JobForm } from "@/components/forms";
import { money, minutesToHours } from "@/lib/utils";

export default async function JobsPage({ searchParams }: { searchParams: { new?: string } }) {
  const { profile } = await requireUser();
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: jobs }, { data: clients }] = demo ? [{ data: demoJobs }, { data: demoClients }] : await Promise.all([
    supabase!.from("jobs").select("id, code, name, status, priority, address, agreed_price, estimated_cost, real_cost, estimated_minutes, real_minutes, clients(name)").order("created_at", { ascending: false }).limit(25),
    supabase!.from("clients").select("id, name").order("name")
  ]);
  const jobRows = (jobs ?? []) as any[];

  const canCreate = profile?.role === "admin";

  return (
    <div>
      <PageTitle title="Trabajos" subtitle="Planificacion, avance, costos y rentabilidad por servicio." />
      {searchParams.new && canCreate ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Nuevo trabajo</h3>
          <JobForm clients={clients ?? []} />
        </section>
      ) : null}
      <div className="grid gap-3">
        {jobRows.map((job) => {
          const margin = Number(job.agreed_price ?? 0) - Number(job.real_cost ?? job.estimated_cost ?? 0);
          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className="glass block rounded-3xl p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-mint">{job.code}</p>
                  <h3 className="text-lg font-bold">{job.name}</h3>
                  <p className="text-xs text-white/55">{Array.isArray(job.clients) ? job.clients[0]?.name : job.clients?.name}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">{job.status.replaceAll("_", " ")}</span>
              </div>
              <p className="mb-3 flex items-center gap-2 text-sm text-white/62"><MapPin size={15} />{job.address}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-white/8 p-3"><TrendingUp className="mx-auto mb-1 text-mint" size={16} />{money(margin)}</div>
                <div className="rounded-2xl bg-white/8 p-3"><Timer className="mx-auto mb-1 text-copper" size={16} />{minutesToHours(job.real_minutes ?? job.estimated_minutes)} h</div>
                <div className="rounded-2xl bg-white/8 p-3 capitalize">{job.priority}</div>
              </div>
            </Link>
          );
        })}
        {!jobRows.length ? <p className="glass rounded-3xl p-5 text-sm text-white/62">No hay trabajos cargados todavia.</p> : null}
      </div>
    </div>
  );
}
