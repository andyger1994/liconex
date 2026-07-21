import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Banknote, Boxes, CalendarDays, Clock3, ReceiptText, Truck, UserPlus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/shell";
import { JobForm } from "@/components/forms";

const actions: { href: string; title: string; subtitle: string; icon: LucideIcon; adminOnly?: boolean }[] = [
  { href: "/expenses?new=1", title: "Gasto", subtitle: "Compra, combustible, herramienta o comprobante.", icon: ReceiptText },
  { href: "/clients?new=1", title: "Cliente", subtitle: "Contacto, direccion, RUT y observaciones.", icon: UserPlus, adminOnly: true },
  { href: "/reports?payment=1", title: "Cobro", subtitle: "Ingreso por cliente o trabajo.", icon: Banknote, adminOnly: true },
  { href: "/materials?new=1", title: "Material", subtitle: "Producto, stock, costo y precio de venta.", icon: Boxes, adminOnly: true },
  { href: "/vehicles?new=1", title: "Vehiculo", subtitle: "Ficha de camioneta, service y kilometraje.", icon: Truck, adminOnly: true },
  { href: "/vehicles?trip=1", title: "Traslado", subtitle: "Km, combustible, peajes y trabajo relacionado.", icon: CalendarDays, adminOnly: true },
  { href: "/employees?new=1", title: "Trabajador", subtitle: "Tecnico, rol, costo horario y especialidad.", icon: Users, adminOnly: true },
  { href: "/time", title: "Jornada", subtitle: "Iniciar o finalizar control horario.", icon: Clock3 }
];

export default async function CreatePage() {
  const { profile } = await requireUser();
  const isAdmin = profile?.role === "admin";
  const supabase = await createClient();
  const { data: clients } = isAdmin ? await supabase.from("clients").select("id, name").order("name") : { data: [] };

  return (
    <div>
      <PageTitle title="Nuevo trabajo" subtitle="Carga directa desde el boton central." />
      {!isAdmin ? (
        <section className="glass mb-5 rounded-3xl border border-copper/30 p-4 text-sm text-white/72">
          Tu usuario esta como tecnico. Podes registrar gastos y jornada, pero trabajos, clientes, cobros, inventario, vehiculos y equipo requieren rol admin.
        </section>
      ) : (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Crear trabajo</h3>
          <JobForm clients={clients ?? []} />
        </section>
      )}

      <h3 className="mb-3 text-sm font-semibold text-white/72">Otros registros</h3>
      <section className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const locked = action.adminOnly && !isAdmin;
          return (
            <Link
              key={action.href}
              href={locked ? "/create" : action.href}
              className={locked ? "glass flex min-h-24 items-center gap-4 rounded-3xl p-4 opacity-55" : "glass flex min-h-24 items-center gap-4 rounded-3xl p-4"}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-mint">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <strong>{action.title}</strong>
                  {locked ? <span className="rounded-full bg-copper/20 px-2 py-1 text-[11px] text-copper">Admin</span> : null}
                </span>
                <span className="mt-1 block text-sm text-white/55">{action.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
