import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoExpenseCategories, demoExpenses, demoJobs, isDemoMode } from "@/lib/demo";
import { PageTitle, StatCard } from "@/components/shell";
import { ExpenseForm } from "@/components/forms";
import { money } from "@/lib/utils";

export default async function ExpensesPage({ searchParams }: { searchParams: { new?: string } }) {
  await requireUser();
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: expenses }, { data: categories }, { data: jobs }] = demo ? [
    { data: demoExpenses },
    { data: demoExpenseCategories },
    { data: demoJobs }
  ] : await Promise.all([
    supabase!.from("expenses").select("id, description, amount, currency, spent_at, approval_status, expense_categories(name), jobs(name)").order("spent_at", { ascending: false }).limit(30),
    supabase!.from("expense_categories").select("id, name").order("name"),
    supabase!.from("jobs").select("id, name").order("created_at", { ascending: false }).limit(30)
  ]);
  const expenseRows = (expenses ?? []) as any[];
  const total = expenseRows.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div>
      <PageTitle title="Gastos" subtitle="Combustible, materiales, herramientas, sueldos y comprobantes." />
      {searchParams.new ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Registrar gasto</h3>
          <ExpenseForm categories={categories ?? []} jobs={jobs ?? []} />
        </section>
      ) : null}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Total listado" value={money(total)} tone="copper" />
        <StatCard label="Pendientes" value={expenseRows.filter((row) => row.approval_status === "pending").length} />
      </div>
      <div className="grid gap-3">
        {expenseRows.map((expense) => (
          <article key={expense.id} className="glass rounded-3xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{expense.description}</h3>
                <p className="text-xs text-white/55">{Array.isArray(expense.expense_categories) ? expense.expense_categories[0]?.name : expense.expense_categories?.name}</p>
              </div>
              <p className="font-bold text-copper">{money(expense.amount, expense.currency)}</p>
            </div>
            <p className="mt-3 text-xs text-white/50">{new Date(expense.spent_at).toLocaleString("es-UY")} · {expense.approval_status}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
