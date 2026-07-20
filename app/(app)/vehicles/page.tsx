import { Fuel, Gauge, Route, Truck, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoVehicleTrips, demoVehicles, isDemoMode } from "@/lib/demo";
import { PageTitle, StatCard } from "@/components/shell";
import { money } from "@/lib/utils";

export default async function VehiclesPage() {
  await requireRole(["admin"]);
  const demo = isDemoMode();
  const supabase = demo ? undefined : await createClient();
  const [{ data: vehicles }, { data: trips }] = demo ? [
    { data: demoVehicles },
    { data: demoVehicleTrips }
  ] : await Promise.all([
    supabase!.from("vehicles").select("id, plate, brand, model, year, fuel_type, odometer_km, estimated_consumption, insurance_due, tax_due, next_service_km, next_oil_change_km, notes").order("plate"),
    supabase!.from("vehicle_trips").select("id, vehicle_id, trip_date, start_km, end_km, distance_km, fuel_loaded, cost, tolls, jobs(name), employees(full_name)").order("trip_date", { ascending: false }).limit(20)
  ]);
  const vehicleRows = (vehicles ?? []) as any[];
  const tripRows = (trips ?? []) as any[];
  const kms = tripRows.reduce((sum, trip) => sum + Number(trip.distance_km), 0);
  const cost = tripRows.reduce((sum, trip) => sum + Number(trip.cost ?? 0) + Number(trip.tolls ?? 0), 0);

  return (
    <div>
      <PageTitle title="Vehiculos" subtitle="Kilometraje, combustible, services y costo de traslados." />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Vehiculos" value={vehicleRows.length} />
        <StatCard label="Km registrados" value={kms} tone="white" />
        <StatCard label="Costo traslados" value={money(cost)} tone="copper" />
        <StatCard label="Viajes" value={tripRows.length} />
      </div>
      <section className="mb-5 grid gap-3">
        {vehicleRows.map((vehicle) => {
          const serviceLeft = Number(vehicle.next_service_km ?? 0) - Number(vehicle.odometer_km ?? 0);
          return (
            <article key={vehicle.id} className="glass rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-mint">{vehicle.plate}</p>
                  <h3 className="text-lg font-bold">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-xs text-white/55">{vehicle.year} · {vehicle.fuel_type}</p>
                </div>
                <Truck className="text-mint" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <p className="rounded-2xl bg-white/8 p-3"><Gauge className="mx-auto mb-1 text-mint" size={16} />{vehicle.odometer_km} km</p>
                <p className="rounded-2xl bg-white/8 p-3"><Fuel className="mx-auto mb-1 text-copper" size={16} />{vehicle.estimated_consumption} L/100</p>
                <p className="rounded-2xl bg-white/8 p-3"><Wrench className="mx-auto mb-1 text-mint" size={16} />{serviceLeft} km</p>
              </div>
            </article>
          );
        })}
      </section>
      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center gap-2"><Route className="text-mint" size={18} /><h3 className="font-bold">Ultimos traslados</h3></div>
        <div className="grid gap-2">
          {tripRows.map((trip) => (
            <div key={trip.id} className="rounded-2xl bg-white/8 p-3 text-sm">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold">{trip.job ?? trip.jobs?.name ?? "Traslado"}</p><span className="text-copper">{trip.distance_km} km</span></div>
              <p className="mt-1 text-xs text-white/55">{new Date(`${trip.trip_date}T00:00:00`).toLocaleDateString("es-UY")} · {trip.driver ?? trip.employees?.full_name ?? "Sin conductor"} · {money(Number(trip.cost ?? 0) + Number(trip.tolls ?? 0))}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
