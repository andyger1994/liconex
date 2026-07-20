import { AlertTriangle, ArrowDownUp, Boxes, PackageCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoInventoryMovements, demoMaterials, isDemoMode } from "@/lib/demo";
import { PageTitle, StatCard } from "@/components/shell";
import { money } from "@/lib/utils";

export default async function MaterialsPage() {
  await requireRole(["admin"]);
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: materials }, { data: movements }] = demo ? [
    { data: demoMaterials },
    { data: demoInventoryMovements }
  ] : await Promise.all([
    supabase!.from("materials").select("id, name, category, brand, model, code, purchase_price, sale_price, unit, current_stock, minimum_stock, location, warranty_until").order("name"),
    supabase!.from("inventory_movements").select("id, material_id, movement_type, quantity, unit_cost, created_at, materials(name), jobs(name)").order("created_at", { ascending: false }).limit(20)
  ]);
  const materialRows = (materials ?? []) as any[];
  const movementRows = (movements ?? []) as any[];
  const lowStock = materialRows.filter((item) => Number(item.current_stock) <= Number(item.minimum_stock)).length;
  const stockValue = materialRows.reduce((sum, item) => sum + Number(item.current_stock) * Number(item.purchase_price), 0);

  return (
    <div>
      <PageTitle title="Inventario" subtitle="Stock, costos, movimientos y alertas de materiales." />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Materiales" value={materialRows.length} />
        <StatCard label="Stock bajo" value={lowStock} tone="copper" />
        <StatCard label="Valor stock" value={money(stockValue)} tone="white" />
        <StatCard label="Movimientos" value={movementRows.length} />
      </div>
      <section className="mb-5 grid gap-3">
        {materialRows.map((item) => {
          const isLow = Number(item.current_stock) <= Number(item.minimum_stock);
          return (
            <article key={item.id} className="glass rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-mint">{item.code}</p>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-xs text-white/55">{item.brand} {item.model} · {item.location}</p>
                </div>
                {isLow ? <AlertTriangle className="text-copper" /> : <PackageCheck className="text-mint" />}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <p className="rounded-2xl bg-white/8 p-3"><Boxes className="mx-auto mb-1 text-mint" size={16} />{item.current_stock} {item.unit}</p>
                <p className="rounded-2xl bg-white/8 p-3">Minimo<br />{item.minimum_stock}</p>
                <p className="rounded-2xl bg-white/8 p-3">Venta<br />{money(item.sale_price)}</p>
              </div>
            </article>
          );
        })}
      </section>
      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center gap-2"><ArrowDownUp className="text-mint" size={18} /><h3 className="font-bold">Ultimos movimientos</h3></div>
        <div className="grid gap-2">
          {movementRows.map((move) => (
            <div key={move.id} className="rounded-2xl bg-white/8 p-3 text-sm">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold">{move.material ?? move.materials?.name ?? "Material"}</p><span className="capitalize text-copper">{move.movement_type}</span></div>
              <p className="mt-1 text-xs text-white/55">{move.quantity} unidades · {move.job ?? move.jobs?.name ?? "Sin trabajo"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
