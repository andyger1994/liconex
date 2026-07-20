import Link from "next/link";
import { Boxes, BriefcaseBusiness, ReceiptText, Truck, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoClients, demoExpenses, demoJobs, demoPayments, isDemoMode } from "@/lib/demo";
import { PageTitle, StatCard } from "@/components/shell";
import { PaymentForm } from "@/components/forms";
import { CategoryBarChart, MoneyTrendChart } from "@/components/stats-chart";
import { money } from "@/lib/utils";

function monthName(value: string) {
  return new Intl.DateTimeFormat("es-UY", { month: "short" }).format(new Date(`${value}-01T00:00:00`));
}

export default async function ReportsPage({ searchParams }: { searchParams: { payment?: string } }) {
  await requireRole(["admin"]);
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: payments }, { data: expenses }, { data: jobs }, { data: clients }] = demo ? [
    { data: demoPayments },
    { data: demoExpenses },
    { data: demoJobs },
    { data: demoClients }
  ] : await Promise.all([
    supabase!.from("payments").select("id, amount, currency, paid_at, status").order("paid_at", { ascending: false }).limit(300),
    supabase!.from("expenses").select("id, amount, currency, spent_at, expense_categories(name)").order("spent_at", { ascending: false }).limit(300),
    supabase!.from("jobs").select("id, name, status, agreed_price, estimated_cost, real_cost").order("created_at", { ascending: false }).limit(80),
    supabase!.from("clients").select("id, name").order("name")
  ]);

  const paymentRows = (payments ?? []) as any[];
  const expenseRows = (expenses ?? []) as any[];
  const jobRows = (jobs ?? []) as any[];
  const income = paymentRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const cost = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const pendingPayments = paymentRows.filter((row) => row.status === "pendiente" || row.status === "vencido").length;
  const margin = income - cost;

  const months = new Map<string, { name: string; ingresos: number; gastos: number; ganancia: number }>();
  for (const payment of paymentRows) {
    const key = payment.paid_at.slice(0, 7);
    const row = months.get(key) ?? { name: monthName(key), ingresos: 0, gastos: 0, ganancia: 0 };
    row.ingresos += Number(payment.amount);
    row.ganancia = row.ingresos - row.gastos;
    months.set(key, row);
  }
  for (const expense of expenseRows) {
    const key = expense.spent_at.slice(0, 7);
    const row = months.get(key) ?? { name: monthName(key), ingresos: 0, gastos: 0, ganancia: 0 };
    row.gastos += Number(expense.amount);
    row.ganancia = row.ingresos - row.gastos;
    months.set(key, row);
  }

  const categories = new Map<string, number>();
  for (const expense of expenseRows) {
    const name = Array.isArray(expense.expense_categories) ? expense.expense_categories[0]?.name : expense.expense_categories?.name;
    categories.set(name ?? "Otros", (categories.get(name ?? "Otros") ?? 0) + Number(expense.amount));
  }

  const opportunities = [
    pendingPayments > 0 ? `Hay ${pendingPayments} pagos pendientes o vencidos.` : null,
    cost > income * 0.65 && income > 0 ? "Los gastos superan el 65% de los ingresos registrados." : null,
    jobRows.some((job) => Number(job.real_cost ?? job.estimated_cost ?? 0) > Number(job.agreed_price ?? 0)) ? "Existen trabajos con costos por encima del precio acordado." : null,
    margin < 0 ? "La rentabilidad del periodo esta en perdida." : null
  ].filter(Boolean);

  return (
    <div>
      <PageTitle title="Reportes" subtitle="Cierre mensual, graficos y oportunidades de mejora." />
      {searchParams.payment ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Registrar cobro</h3>
          <PaymentForm clients={clients ?? []} jobs={jobs ?? []} />
        </section>
      ) : null}
      <section className="mb-5 grid grid-cols-2 gap-3">
        {[
          ["/clients", "Clientes", Users],
          ["/employees", "Equipo", BriefcaseBusiness],
          ["/expenses", "Gastos", ReceiptText],
          ["/materials", "Inventario", Boxes],
          ["/vehicles", "Vehiculos", Truck]
        ].map(([href, label, Icon]: any) => (
          <Link key={href} href={href} className="glass flex min-h-20 items-center gap-3 rounded-2xl p-4 text-sm font-semibold">
            <Icon className="text-mint" size={20} />
            {label}
          </Link>
        ))}
      </section>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Ingresos" value={money(income)} />
        <StatCard label="Gastos" value={money(cost)} tone="copper" />
        <StatCard label="Ganancia" value={money(margin)} tone={margin >= 0 ? "mint" : "copper"} />
        <StatCard label="Trabajos" value={jobRows.length} tone="white" />
      </div>
      <section className="glass mb-5 rounded-3xl p-5">
        <h3 className="mb-3 font-bold">Evolucion mensual</h3>
        <MoneyTrendChart data={Array.from(months.values()).reverse().slice(-6)} />
      </section>
      <section className="glass mb-5 rounded-3xl p-5">
        <h3 className="mb-3 font-bold">Gastos por categoria</h3>
        <CategoryBarChart data={Array.from(categories.entries()).map(([name, total]) => ({ name, total })).slice(0, 8)} />
      </section>
      <section className="glass rounded-3xl p-5">
        <h3 className="mb-3 font-bold text-copper">Oportunidades de mejora</h3>
        <div className="grid gap-2 text-sm text-white/72">
          {opportunities.length ? opportunities.map((text) => <p key={text} className="rounded-2xl bg-white/8 p-3">{text}</p>) : <p className="rounded-2xl bg-white/8 p-3">No hay alertas criticas con los datos actuales.</p>}
        </div>
      </section>
    </div>
  );
}


