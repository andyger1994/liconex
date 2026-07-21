import { z } from "zod";

export const optionalMoney = z.coerce.number().min(0).optional().default(0);
export const uuid = z.string().uuid();

export const jobSchema = z.object({
  name: z.string().min(3, "Escribe un nombre claro"),
  client_id: z.string().uuid().optional().or(z.literal("")),
  address: z.string().min(3, "La direccion es obligatoria"),
  service_type: z.string().min(2),
  description: z.string().optional(),
  status: z.string().min(2),
  priority: z.string().min(2),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  agreed_price: optionalMoney,
  advance_amount: optionalMoney,
  estimated_cost: optionalMoney,
  estimated_minutes: z.coerce.number().min(0).optional().default(0)
});

export const clientSchema = z.object({
  name: z.string().min(2),
  document: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  client_type: z.string().min(2),
  contact_person: z.string().optional(),
  notes: z.string().optional()
});

export const employeeSchema = z.object({
  full_name: z.string().min(2),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["admin", "technician"]),
  position: z.string().optional(),
  specialty: z.string().optional(),
  hourly_rate: optionalMoney,
  overtime_rate: optionalMoney,
  monthly_salary: optionalMoney
});

export const expenseSchema = z.object({
  category_id: z.string().uuid(),
  description: z.string().min(3),
  amount: z.coerce.number().positive(),
  currency: z.enum(["UYU", "USD"]),
  payment_method: z.string().min(2),
  spent_at: z.string().min(10),
  job_id: z.string().uuid().optional().or(z.literal("")),
  supplier: z.string().optional(),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  client_id: z.string().uuid(),
  job_id: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().positive(),
  currency: z.enum(["UYU", "USD"]),
  payment_method: z.string().min(2),
  paid_at: z.string().min(10),
  status: z.string().min(2),
  notes: z.string().optional()
});

export const jobActivitySchema = z.object({
  job_id: uuid,
  description: z.string().min(5, "Describe la actividad realizada"),
  minutes_used: z.coerce.number().min(0).default(0),
  status: z.string().min(2).default("registrada"),
  materials_used: z.string().optional(),
  problems: z.string().optional(),
  solution: z.string().optional(),
  pending_tasks: z.string().optional()
});

export const jobMaterialSchema = z.object({
  job_id: uuid,
  material_id: uuid,
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero"),
  unit_cost: z.coerce.number().min(0).default(0)
});

export const materialSchema = z.object({
  name: z.string().min(2, "Escribe el nombre del material"),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  code: z.string().optional(),
  purchase_price: optionalMoney,
  sale_price: optionalMoney,
  unit: z.string().min(1).default("unidad"),
  current_stock: z.coerce.number().min(0).default(0),
  minimum_stock: z.coerce.number().min(0).default(0),
  location: z.string().optional(),
  warranty_until: z.string().optional(),
  notes: z.string().optional()
});

export const vehicleSchema = z.object({
  plate: z.string().min(3, "Escribe la matricula"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional().or(z.literal("")),
  fuel_type: z.string().optional(),
  odometer_km: z.coerce.number().min(0).default(0),
  estimated_consumption: z.coerce.number().min(0).optional().or(z.literal("")),
  insurance_due: z.string().optional(),
  tax_due: z.string().optional(),
  next_service_km: z.coerce.number().min(0).optional().or(z.literal("")),
  next_oil_change_km: z.coerce.number().min(0).optional().or(z.literal("")),
  notes: z.string().optional()
});

export const vehicleTripSchema = z.object({
  vehicle_id: uuid,
  job_id: z.string().uuid().optional().or(z.literal("")),
  driver_id: z.string().uuid().optional().or(z.literal("")),
  trip_date: z.string().min(10),
  start_km: z.coerce.number().min(0),
  end_km: z.coerce.number().min(0),
  fuel_loaded: z.coerce.number().min(0).default(0),
  cost: optionalMoney,
  tolls: optionalMoney,
  notes: z.string().optional()
});

export const attachmentSchema = z.object({
  module: z.string().min(2),
  record_id: uuid,
  label: z.string().optional()
});
