import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/shell";
import { ClientForm } from "@/components/forms";
import { money } from "@/lib/utils";

export default async function ClientsPage({ searchParams }: { searchParams: { new?: string } }) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, phone, whatsapp, email, address, client_type, total_billed, total_collected, pending_debt")
    .order("name");

  return (
    <div>
      <PageTitle title="Clientes" subtitle="Contactos, deuda, historial y accesos rapidos." />
      {searchParams.new ? (
        <section className="glass mb-5 rounded-3xl p-5">
          <h3 className="mb-4 text-lg font-bold">Agregar cliente</h3>
          <ClientForm />
        </section>
      ) : null}
      <div className="grid gap-3">
        {(clients ?? []).map((client) => (
          <article key={client.id} className="glass rounded-3xl p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{client.name}</h3>
                <p className="text-xs capitalize text-white/55">{client.client_type}</p>
              </div>
              <p className="text-right text-sm text-copper">{money(client.pending_debt)}</p>
            </div>
            <p className="mb-3 flex items-center gap-2 text-sm text-white/62"><MapPin size={15} />{client.address ?? "Sin direccion"}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link className="rounded-2xl bg-white/8 p-3 text-center text-xs" href={`tel:${client.phone ?? ""}`}><Phone className="mx-auto mb-1 text-mint" size={16} />Llamar</Link>
              <Link className="rounded-2xl bg-white/8 p-3 text-center text-xs" href={`https://wa.me/${client.whatsapp ?? client.phone ?? ""}`}><MessageCircle className="mx-auto mb-1 text-mint" size={16} />WhatsApp</Link>
              <Link className="rounded-2xl bg-white/8 p-3 text-center text-xs" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address ?? client.name)}`}>Mapa</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
