import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoEmployees, isDemoMode } from "@/lib/demo";
import { PageTitle, StatCard } from "@/components/shell";
import { EmployeeForm } from "@/components/forms";
import { money } from "@/lib/utils";

export default async function EmployeesPage({ searchParams }: { searchParams: { new?: string } }) {
  await requireRole(["admin"]);
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const { data: employees } = demo ? { data: demoEmployees } : await supabase!.from("employees").select("id, full_name, role, position, specialty, hourly_rate, overtime_rate, is_active").order("full_name");

  return (
    <div>
      <PageTitle title="Trabajadores" subtitle="Ficha, costo horario, rol y estado laboral." />
      {searchParams.new ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Agregar trabajador</h3>
          <EmployeeForm />
        </section>
      ) : null}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Activos" value={employees?.filter((row) => row.is_active).length ?? 0} />
        <StatCard label="Tecnicos" value={employees?.filter((row) => row.role === "technician").length ?? 0} tone="copper" />
      </div>
      <div className="grid gap-3">
        {(employees ?? []).map((employee) => (
          <article key={employee.id} className="glass rounded-3xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{employee.full_name}</h3>
                <p className="text-sm text-white/58">{employee.position ?? employee.specialty ?? "Sin cargo"}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">{employee.role}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <p className="rounded-2xl bg-white/8 p-3">Hora: {money(employee.hourly_rate)}</p>
              <p className="rounded-2xl bg-white/8 p-3">Extra: {money(employee.overtime_rate)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
