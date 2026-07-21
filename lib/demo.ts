import type { Profile } from "@/lib/types";

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("demo.supabase.co");
}

export const demoProfile: Profile = {
  id: "00000000-0000-4000-8000-000000000001",
  full_name: "Administrador Demo",
  email: "demo@liconex.local",
  role: "admin"
};

export const demoClients = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Edificio Centro",
    document: "218765430012",
    phone: "099123456",
    whatsapp: "59899123456",
    email: "contacto@edificiocentro.local",
    address: "18 de Julio 1234, Montevideo",
    client_type: "empresa",
    total_billed: 128000,
    total_collected: 96000,
    pending_debt: 32000
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Casa Carrasco",
    document: "45678912",
    phone: "098654321",
    whatsapp: "59898654321",
    email: "cliente@casa.local",
    address: "Av. Italia 6400, Montevideo",
    client_type: "particular",
    total_billed: 47500,
    total_collected: 47500,
    pending_debt: 0
  }
];

export const demoJobs = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    code: "LIC-240701",
    name: "Instalacion de camaras IP",
    status: "en_proceso",
    priority: "alta",
    address: "18 de Julio 1234, Montevideo",
    service_type: "Camaras de seguridad",
    scheduled_date: "2026-07-22",
    scheduled_time: "09:00",
    due_date: "2026-07-25",
    warranty_until: "2027-07-25",
    next_maintenance: "2026-10-25",
    agreed_price: 62000,
    estimated_cost: 38500,
    real_cost: 42100,
    estimated_minutes: 960,
    real_minutes: 780,
    clients: { name: "Edificio Centro" }
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    code: "LIC-240702",
    name: "Mantenimiento alarma perimetral",
    status: "programado",
    priority: "media",
    address: "Av. Italia 6400, Montevideo",
    service_type: "Alarmas",
    scheduled_date: "2026-07-23",
    scheduled_time: "14:30",
    due_date: "2026-07-23",
    warranty_until: "2026-12-23",
    next_maintenance: "2026-09-23",
    agreed_price: 18500,
    estimated_cost: 9800,
    real_cost: 0,
    estimated_minutes: 240,
    real_minutes: 0,
    clients: { name: "Casa Carrasco" }
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    code: "LIC-240703",
    name: "Reparacion tablero general",
    status: "finalizado",
    priority: "urgente",
    address: "Bulevar Artigas 2100, Montevideo",
    service_type: "Instalacion electrica",
    scheduled_date: "2026-07-19",
    scheduled_time: "08:00",
    due_date: "2026-07-19",
    warranty_until: "2027-01-19",
    next_maintenance: null,
    agreed_price: 39000,
    estimated_cost: 22000,
    real_cost: 24750,
    estimated_minutes: 420,
    real_minutes: 510,
    clients: { name: "Comercio Prado" }
  }
];

export const demoEmployees = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    full_name: "Martin Silva",
    role: "technician",
    position: "Tecnico instalador",
    specialty: "Camaras y redes",
    hourly_rate: 520,
    overtime_rate: 780,
    is_active: true
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    full_name: "Lucia Pereira",
    role: "admin",
    position: "Administracion",
    specialty: "Gestion operativa",
    hourly_rate: 0,
    overtime_rate: 0,
    is_active: true
  }
];

export const demoExpenseCategories = [
  { id: "40000000-0000-4000-8000-000000000001", name: "Combustible" },
  { id: "40000000-0000-4000-8000-000000000002", name: "Materiales" },
  { id: "40000000-0000-4000-8000-000000000003", name: "Herramientas" },
  { id: "40000000-0000-4000-8000-000000000004", name: "Peajes" }
];

export const demoExpenses = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    description: "Carga de combustible camioneta",
    amount: 3200,
    currency: "UYU",
    spent_at: "2026-07-20T08:25:00",
    approval_status: "pending",
    expense_categories: { name: "Combustible" },
    jobs: { name: "Instalacion de camaras IP" }
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    description: "Cable UTP Cat6 y conectores",
    amount: 8700,
    currency: "UYU",
    spent_at: "2026-07-19T16:40:00",
    approval_status: "approved",
    expense_categories: { name: "Materiales" },
    jobs: { name: "Instalacion de camaras IP" }
  }
];

export const demoPayments = [
  { id: "60000000-0000-4000-8000-000000000001", amount: 30000, currency: "UYU", paid_at: "2026-07-20", status: "cobrado" },
  { id: "60000000-0000-4000-8000-000000000002", amount: 47500, currency: "UYU", paid_at: "2026-07-18", status: "cobrado" },
  { id: "60000000-0000-4000-8000-000000000003", amount: 32000, currency: "UYU", paid_at: "2026-07-28", status: "pendiente" }
];

export const demoWorkSessions = [
  {
    id: "70000000-0000-4000-8000-000000000001",
    user_id: demoProfile.id,
    started_at: "2026-07-20T08:05:00",
    ended_at: null,
    total_minutes: 0,
    approval_status: "pending",
    job_id: demoJobs[0].id,
    jobs: { name: "Instalacion de camaras IP" }
  },
  {
    id: "70000000-0000-4000-8000-000000000002",
    user_id: demoProfile.id,
    started_at: "2026-07-19T08:00:00",
    ended_at: "2026-07-19T16:30:00",
    total_minutes: 510,
    approval_status: "approved",
    job_id: demoJobs[2].id,
    jobs: { name: "Reparacion tablero general" }
  }
];

export const demoMaterials = [
  { id: "80000000-0000-4000-8000-000000000001", name: "Camara IP domo 4MP", category: "Camaras", brand: "Hikvision", model: "DS-2CD1143G2", code: "CAM-IP-4MP", supplier: "Proveedor Seguridad", purchase_price: 2150, sale_price: 3150, unit: "unidad", current_stock: 6, minimum_stock: 4, location: "Deposito principal", warranty_until: "2027-04-10" },
  { id: "80000000-0000-4000-8000-000000000002", name: "Cable UTP Cat6 exterior", category: "Redes", brand: "Furukawa", model: "Cat6 Outdoor", code: "CAB-CAT6-EXT", supplier: "Electro Redes", purchase_price: 42, sale_price: 68, unit: "metro", current_stock: 180, minimum_stock: 250, location: "Estanteria B", warranty_until: null },
  { id: "80000000-0000-4000-8000-000000000003", name: "Sensor magnetico inalambrico", category: "Alarmas", brand: "Ajax", model: "DoorProtect", code: "ALM-SEN-MAG", supplier: "Proveedor Seguridad", purchase_price: 1280, sale_price: 1890, unit: "unidad", current_stock: 2, minimum_stock: 5, location: "Caja alarmas", warranty_until: "2027-02-15" }
];

export const demoInventoryMovements = [
  { id: "81000000-0000-4000-8000-000000000001", material_id: demoMaterials[0].id, material: "Camara IP domo 4MP", movement_type: "salida", quantity: 4, unit_cost: 2150, job: "Instalacion de camaras IP", created_at: "2026-07-20T09:10:00" },
  { id: "81000000-0000-4000-8000-000000000002", material_id: demoMaterials[1].id, material: "Cable UTP Cat6 exterior", movement_type: "salida", quantity: 120, unit_cost: 42, job: "Instalacion de camaras IP", created_at: "2026-07-20T09:20:00" },
  { id: "81000000-0000-4000-8000-000000000003", material_id: demoMaterials[2].id, material: "Sensor magnetico inalambrico", movement_type: "ajuste", quantity: -1, unit_cost: 1280, job: "Material danado", created_at: "2026-07-19T17:05:00" }
];

export const demoVehicles = [
  { id: "90000000-0000-4000-8000-000000000001", plate: "SAB 1234", brand: "Renault", model: "Kangoo", year: 2021, fuel_type: "Nafta", odometer_km: 84210, estimated_consumption: 9.4, insurance_due: "2026-11-10", tax_due: "2026-09-30", next_service_km: 90000, next_oil_change_km: 87500, notes: "Vehiculo principal para instalaciones urbanas." },
  { id: "90000000-0000-4000-8000-000000000002", plate: "SCB 9876", brand: "Fiat", model: "Fiorino", year: 2019, fuel_type: "Diesel", odometer_km: 126400, estimated_consumption: 7.8, insurance_due: "2026-08-14", tax_due: "2026-12-31", next_service_km: 130000, next_oil_change_km: 128000, notes: "Usar para traslados con escalera y herramientas pesadas." }
];

export const demoVehicleTrips = [
  { id: "91000000-0000-4000-8000-000000000001", vehicle_id: demoVehicles[0].id, job: "Instalacion de camaras IP", driver: "Martin Silva", trip_date: "2026-07-20", start_km: 84180, end_km: 84210, distance_km: 30, fuel_loaded: 18, cost: 3200, tolls: 0 },
  { id: "91000000-0000-4000-8000-000000000002", vehicle_id: demoVehicles[1].id, job: "Reparacion tablero general", driver: "Martin Silva", trip_date: "2026-07-19", start_km: 126355, end_km: 126400, distance_km: 45, fuel_loaded: 0, cost: 0, tolls: 180 }
];

export const demoJobActivities = [
  { id: "a0000000-0000-4000-8000-000000000001", job_id: demoJobs[0].id, technician: "Martin Silva", activity_at: "2026-07-20T10:15:00", description: "Canalizacion, tendido de cableado y montaje de dos camaras exteriores.", minutes_used: 180, status: "en_proceso", materials_used: "2 camaras IP, 80m UTP Cat6", problems: "Una canaleta existente estaba obstruida.", solution: "Se rehizo el tramo por bandeja lateral.", pending_tasks: "Configurar NVR y probar acceso remoto." },
  { id: "a0000000-0000-4000-8000-000000000002", job_id: demoJobs[2].id, technician: "Martin Silva", activity_at: "2026-07-19T15:50:00", description: "Cambio de termica principal y ajuste de borneras flojas.", minutes_used: 240, status: "finalizado", materials_used: "1 termica 63A, punteras, terminales", problems: "Sobretemperatura en entrada del tablero.", solution: "Se reemplazo componente danado y se verifico carga.", pending_tasks: "Enviar informe al cliente." }
];
