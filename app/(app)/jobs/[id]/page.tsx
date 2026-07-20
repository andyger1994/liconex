import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2, ClipboardPenLine, FileSignature, MapPin, Package, Timer, TrendingUp, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoExpenses, demoInventoryMovements, demoJobActivities, demoJobs, demoMaterials, isDemoMode } from "@/lib/demo";
import { AttachmentForm, JobActivityForm, JobMaterialForm } from "@/components/forms";
import { PageTitle, StatCard } from "@/components/shell";
import { minutesToHours, money } from "@/lib/utils";

export default async function JobDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { panel?: string } }) {
  await requireUser();
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();

  const job = demo
    ? demoJobs.find((row) => row.id === params.id)
    : ((await supabase!
        .from("jobs")
        .select("id, code, name, status, priority, address, service_type, description, scheduled_date, scheduled_time, due_date, warranty_until, next_maintenance, agreed_price, advance_amount, estimated_cost, real_cost, estimated_minutes, real_minutes, internal_notes, client_notes, clients(name, phone, whatsapp)")
        .eq("id", params.id)
        .single()).data as any);

  if (!job) notFound();

  const [{ data: activities }, { data: expenses }, { data: jobMaterials }, { data: history }, { data: materials }, { data: attachments }] = demo
    ? [
        { data: demoJobActivities.filter((row) => row.job_id === params.id) },
        { data: demoExpenses.filter((row) => row.jobs?.name === job.name) },
        { data: demoInventoryMovements.filter((row) => row.job === job.name) },
        { data: [
          { id: `${job.id}-new`, old_status: null, new_status: "nuevo", created_at: "2026-07-18T09:00:00" },
          { id: `${job.id}-status`, old_status: "programado", new_status: job.status, created_at: "2026-07-20T08:40:00" }
        ] },
        { data: demoMaterials },
        { data: [
          { id: `${job.id}-before`, file_name: "foto-antes-demo.webp", bucket: "job-photos", path: "demo/foto-antes.webp", created_at: "2026-07-20T08:45:00" },
          { id: `${job.id}-receipt`, file_name: "conformidad-cliente-demo.pdf", bucket: "attachments", path: "demo/conformidad.pdf", created_at: "2026-07-20T12:20:00" }
        ] }
      ]
    : await Promise.all([
        supabase!.from("job_activities").select("id, activity_at, description, minutes_used, status, materials_used, problems, solution, pending_tasks, profiles(full_name)").eq("job_id", params.id).order("activity_at", { ascending: false }),
        supabase!.from("expenses").select("id, description, amount, currency, spent_at, expense_categories(name)").eq("job_id", params.id).order("spent_at", { ascending: false }),
        supabase!.from("job_materials").select("id, quantity, unit_cost, materials(name, unit)").eq("job_id", params.id),
        supabase!.from("job_status_history").select("id, old_status, new_status, created_at").eq("job_id", params.id).order("created_at", { ascending: false }),
        supabase!.from("materials").select("id, name, purchase_price, unit").order("name"),
        supabase!.from("attachments").select("id, bucket, path, file_name, mime_type, size_bytes, created_at").eq("module", "jobs").eq("record_id", params.id).order("created_at", { ascending: false })
      ]);

  const activityRows = (activities ?? []) as any[];
  const expenseRows = (expenses ?? []) as any[];
  const materialRows = (jobMaterials ?? []) as any[];
  const historyRows = (history ?? []) as any[];
  const availableMaterials = (materials ?? []) as any[];
  const attachmentRows = (attachments ?? []) as any[];
  const materialCost = materialRows.reduce((sum, row) => sum + Number(row.quantity ?? 0) * Number(row.unit_cost ?? 0), 0);
  const expenseCost = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const totalCost = Number(job.real_cost ?? job.estimated_cost ?? 0) || materialCost + expenseCost;
  const income = Number(job.agreed_price ?? 0);
  const profit = income - totalCost;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;
  const activityMinutes = activityRows.reduce((sum, row) => sum + Number(row.minutes_used ?? 0), 0);

  return (
    <div>
      <Link href="/jobs" className="mb-4 inline-flex items-center gap-2 text-sm text-white/65">
        <ArrowLeft size={16} />
        Trabajos
      </Link>
      <PageTitle title={job.name} subtitle={`${job.code ?? "Sin codigo"} · ${job.service_type ?? "Servicio tecnico"}`} />

      <section className="glass mb-5 rounded-3xl p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-mint">Estado actual</p>
            <h3 className="mt-1 text-2xl font-black capitalize">{String(job.status).replaceAll("_", " ")}</h3>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">{job.priority}</span>
        </div>
        <p className="mb-4 flex items-center gap-2 text-sm text-white/65">
          <MapPin size={16} className="text-mint" />
          {job.address}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/jobs/${job.id}?panel=archivo`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-5 text-sm font-semibold text-white"><Camera size={18} /> Foto</Link>
          <Link href={`/jobs/${job.id}?panel=actividad`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-5 text-sm font-semibold text-white"><ClipboardPenLine size={18} /> Actividad</Link>
          <Link href={`/jobs/${job.id}?panel=material`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-5 text-sm font-semibold text-white"><Package size={18} /> Material</Link>
          <Link href={`/jobs/${job.id}?panel=archivo`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-5 text-sm font-semibold text-white"><FileSignature size={18} /> Firma</Link>
        </div>
      </section>

      {searchParams.panel ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">
              {searchParams.panel === "actividad" ? "Registrar actividad" : searchParams.panel === "material" ? "Imputar material" : "Subir archivo"}
            </h3>
            <Link href={`/jobs/${job.id}`} className="text-sm text-mint">Cerrar</Link>
          </div>
          {searchParams.panel === "actividad" ? <JobActivityForm jobId={job.id} /> : null}
          {searchParams.panel === "material" ? <JobMaterialForm jobId={job.id} materials={availableMaterials} /> : null}
          {searchParams.panel === "archivo" ? <AttachmentForm jobId={job.id} /> : null}
        </section>
      ) : null}

      <section className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Precio" value={money(income)} />
        <StatCard label="Costo" value={money(totalCost)} tone="copper" />
        <StatCard label="Ganancia" value={money(profit)} tone={profit >= 0 ? "mint" : "copper"} />
        <StatCard label="Margen" value={`${margin}%`} tone={margin >= 25 ? "mint" : "copper"} />
      </section>

      <section className="glass mb-5 rounded-3xl p-5">
        <h3 className="mb-3 font-bold">Rentabilidad</h3>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className={margin >= 25 ? "h-full rounded-full bg-mint" : "h-full rounded-full bg-copper"} style={{ width: `${Math.max(4, Math.min(100, margin))}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <p className="rounded-2xl bg-white/8 p-3"><Timer className="mb-1 text-copper" size={16} />{minutesToHours(job.real_minutes ?? activityMinutes ?? job.estimated_minutes)} h reales</p>
          <p className="rounded-2xl bg-white/8 p-3"><TrendingUp className="mb-1 text-mint" size={16} />{margin >= 30 ? "Muy rentable" : margin >= 15 ? "Rentable" : margin >= 0 ? "Poco rentable" : "En perdida"}</p>
        </div>
      </section>

      <section className="glass mb-5 rounded-3xl p-5">
        <h3 className="mb-4 font-bold">Linea de tiempo</h3>
        <div className="grid gap-3">
          {activityRows.map((activity) => (
            <article key={activity.id} className="rounded-2xl bg-white/8 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{activity.technician ?? activity.profiles?.full_name ?? "Tecnico"}</p>
                <span className="text-xs text-white/50">{new Date(activity.activity_at).toLocaleString("es-UY")}</span>
              </div>
              <p className="text-sm text-white/76">{activity.description}</p>
              <div className="mt-3 grid gap-2 text-xs text-white/58">
                {activity.materials_used ? <p>Materiales: {activity.materials_used}</p> : null}
                {activity.problems ? <p>Problema: {activity.problems}</p> : null}
                {activity.solution ? <p>Solucion: {activity.solution}</p> : null}
                {activity.pending_tasks ? <p>Pendiente: {activity.pending_tasks}</p> : null}
              </div>
            </article>
          ))}
          {!activityRows.length ? <p className="text-sm text-white/55">Sin actividades registradas todavia.</p> : null}
        </div>
      </section>

      <section className="mb-5 grid gap-3">
        <div className="glass rounded-3xl p-5">
          <h3 className="mb-3 font-bold">Materiales del trabajo</h3>
          <div className="grid gap-2">
            {materialRows.map((row) => {
              const name = row.material ?? row.materials?.name ?? demoMaterials.find((mat) => mat.id === row.material_id)?.name ?? "Material";
              return (
                <p key={row.id} className="flex justify-between rounded-2xl bg-white/8 p-3 text-sm">
                  <span>{name}</span>
                  <span className="text-copper">{row.quantity} · {money(Number(row.quantity ?? 0) * Number(row.unit_cost ?? 0))}</span>
                </p>
              );
            })}
            {!materialRows.length ? <p className="text-sm text-white/55">Sin materiales imputados.</p> : null}
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <h3 className="mb-3 font-bold">Fotos y documentos</h3>
          <div className="grid gap-2">
            {attachmentRows.map((row) => (
              <p key={row.id} className="flex justify-between rounded-2xl bg-white/8 p-3 text-sm">
                <span>{row.file_name}</span>
                <span className="text-xs text-white/45">{row.bucket}</span>
              </p>
            ))}
            {!attachmentRows.length ? <p className="text-sm text-white/55">Sin archivos subidos.</p> : null}
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <h3 className="mb-3 font-bold">Historial de estado</h3>
          <div className="grid gap-2">
            {historyRows.map((row) => (
              <p key={row.id} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm">
                <CheckCircle2 className="text-mint" size={16} />
                <span className="capitalize">{row.old_status ? `${row.old_status} -> ` : ""}{String(row.new_status).replaceAll("_", " ")}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {profit < 0 || margin < 15 ? (
        <section className="glass rounded-3xl p-5">
          <div className="mb-2 flex items-center gap-2 text-copper">
            <TriangleAlert size={18} />
            <h3 className="font-bold">Atencion</h3>
          </div>
          <p className="text-sm text-white/68">Este trabajo necesita revision de costos, horas o precio acordado para mejorar la rentabilidad.</p>
        </section>
      ) : null}
    </div>
  );
}
