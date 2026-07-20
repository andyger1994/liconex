"use client";

import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/input";
import { clientSchema, employeeSchema, expenseSchema, jobActivitySchema, jobMaterialSchema, jobSchema, paymentSchema } from "@/lib/schemas/common";
import { assignJobMaterial, createClientRecord, createEmployee, createExpense, createJob, createJobActivity, createPayment, uploadAttachment } from "@/lib/actions/crud";

type Option = { id: string; name: string };
type Category = { id: string; name: string };
type Material = { id: string; name: string; purchase_price?: number; unit?: string };

function ErrorLine({ state }: { state: { error?: string } | null }) {
  return state?.error ? <p className="rounded-2xl bg-danger/15 p-3 text-sm text-danger">{state.error}</p> : null;
}

export function JobForm({ clients }: { clients: Option[] }) {
  const [state, action] = useFormState(createJob, null);
  useForm<z.infer<typeof jobSchema>>({ resolver: zodResolver(jobSchema) });
  return (
    <form action={action} className="grid gap-4">
      <Field label="Nombre del trabajo" name="name" required />
      <Select label="Cliente" name="client_id">
        <option value="">Sin cliente</option>
        {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
      </Select>
      <Field label="Direccion" name="address" required />
      <Select label="Tipo de servicio" name="service_type" defaultValue="Instalacion electrica">
        {["Camaras de seguridad", "Alarmas", "Control de acceso", "Instalacion electrica", "Mantenimiento", "Redes", "Porteros", "Automatizacion", "Diagnostico", "Presupuesto", "Otro"].map((name) => <option key={name}>{name}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Estado" name="status" defaultValue="nuevo">
          {["nuevo", "presupuestado", "aprobado", "programado", "en_camino", "en_proceso", "pausado", "pendiente_materiales", "pendiente_cliente", "finalizado", "facturado", "cobrado", "cancelado", "en_garantia"].map((name) => <option key={name} value={name}>{name.replaceAll("_", " ")}</option>)}
        </Select>
        <Select label="Prioridad" name="priority" defaultValue="media">
          {["baja", "media", "alta", "urgente"].map((name) => <option key={name}>{name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" name="scheduled_date" type="date" />
        <Field label="Hora" name="scheduled_time" type="time" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio acordado" name="agreed_price" type="number" min="0" step="1" />
        <Field label="Anticipo" name="advance_amount" type="number" min="0" step="1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Costo estimado" name="estimated_cost" type="number" min="0" step="1" />
        <Field label="Minutos estimados" name="estimated_minutes" type="number" min="0" step="15" />
      </div>
      <TextArea label="Descripcion" name="description" />
      <ErrorLine state={state} />
      <SubmitButton label="Crear trabajo" pendingLabel="Guardando..." />
    </form>
  );
}

export function ClientForm() {
  const [state, action] = useFormState(createClientRecord, null);
  useForm<z.infer<typeof clientSchema>>({ resolver: zodResolver(clientSchema) });
  return (
    <form action={action} className="grid gap-4">
      <Field label="Nombre o razon social" name="name" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Documento/RUT" name="document" />
        <Select label="Tipo" name="client_type" defaultValue="empresa">
          {["empresa", "particular", "constructora", "comercio", "institucion"].map((name) => <option key={name}>{name}</option>)}
        </Select>
      </div>
      <Field label="Telefono" name="phone" />
      <Field label="WhatsApp" name="whatsapp" />
      <Field label="Correo" name="email" type="email" />
      <Field label="Direccion" name="address" />
      <Field label="Contacto" name="contact_person" />
      <TextArea label="Observaciones" name="notes" />
      <ErrorLine state={state} />
      <SubmitButton label="Agregar cliente" pendingLabel="Guardando..." />
    </form>
  );
}

export function EmployeeForm() {
  const [state, action] = useFormState(createEmployee, null);
  useForm<z.infer<typeof employeeSchema>>({ resolver: zodResolver(employeeSchema) });
  return (
    <form action={action} className="grid gap-4">
      <Field label="Nombre completo" name="full_name" required />
      <Field label="Documento" name="document" />
      <Field label="Telefono" name="phone" />
      <Field label="Correo" name="email" type="email" />
      <Select label="Rol" name="role" defaultValue="technician">
        <option value="technician">Tecnico</option>
        <option value="admin">Administrador</option>
      </Select>
      <Field label="Cargo" name="position" />
      <Field label="Especialidad" name="specialty" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Hora" name="hourly_rate" type="number" min="0" />
        <Field label="Extra" name="overtime_rate" type="number" min="0" />
        <Field label="Sueldo" name="monthly_salary" type="number" min="0" />
      </div>
      <ErrorLine state={state} />
      <SubmitButton label="Agregar trabajador" pendingLabel="Guardando..." />
    </form>
  );
}

export function ExpenseForm({ categories, jobs }: { categories: Category[]; jobs: Option[] }) {
  const [state, action] = useFormState(createExpense, null);
  useForm<z.infer<typeof expenseSchema>>({ resolver: zodResolver(expenseSchema) });
  return (
    <form action={action} className="grid gap-4">
      <Select label="Categoria" name="category_id" required>
        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </Select>
      <Field label="Descripcion" name="description" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Importe" name="amount" type="number" min="0" step="0.01" required />
        <Select label="Moneda" name="currency" defaultValue="UYU">
          <option>UYU</option>
          <option>USD</option>
        </Select>
      </div>
      <Field label="Fecha" name="spent_at" type="datetime-local" required />
      <Select label="Forma de pago" name="payment_method" defaultValue="efectivo">
        {["efectivo", "transferencia", "debito", "credito", "mercado_pago", "otro"].map((name) => <option key={name}>{name}</option>)}
      </Select>
      <Select label="Trabajo relacionado" name="job_id">
        <option value="">Sin trabajo</option>
        {jobs.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
      </Select>
      <Field label="Proveedor" name="supplier" />
      <TextArea label="Observaciones" name="notes" />
      <ErrorLine state={state} />
      <SubmitButton label="Registrar gasto" pendingLabel="Guardando..." />
    </form>
  );
}

export function PaymentForm({ clients, jobs }: { clients: Option[]; jobs: Option[] }) {
  const [state, action] = useFormState(createPayment, null);
  useForm<z.infer<typeof paymentSchema>>({ resolver: zodResolver(paymentSchema) });
  return (
    <form action={action} className="grid gap-4">
      <Select label="Cliente" name="client_id" required>
        {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
      </Select>
      <Select label="Trabajo" name="job_id">
        <option value="">Sin trabajo</option>
        {jobs.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Importe" name="amount" type="number" min="0" required />
        <Select label="Moneda" name="currency" defaultValue="UYU"><option>UYU</option><option>USD</option></Select>
      </div>
      <Field label="Fecha" name="paid_at" type="date" required />
      <Select label="Forma de pago" name="payment_method" defaultValue="transferencia">
        {["efectivo", "transferencia", "debito", "credito", "mercado_pago", "cheque", "otro"].map((name) => <option key={name}>{name}</option>)}
      </Select>
      <Select label="Estado" name="status" defaultValue="cobrado"><option>pendiente</option><option>parcial</option><option>cobrado</option><option>vencido</option></Select>
      <TextArea label="Observaciones" name="notes" />
      <ErrorLine state={state} />
      <SubmitButton label="Registrar cobro" pendingLabel="Guardando..." />
    </form>
  );
}

export function JobActivityForm({ jobId }: { jobId: string }) {
  const [state, action] = useFormState(createJobActivity, null);
  useForm<z.infer<typeof jobActivitySchema>>({ resolver: zodResolver(jobActivitySchema) });
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="job_id" value={jobId} />
      <TextArea label="Descripcion detallada" name="description" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minutos usados" name="minutes_used" type="number" min="0" step="15" />
        <Select label="Estado" name="status" defaultValue="registrada">
          {["registrada", "en_proceso", "pendiente", "finalizado"].map((name) => <option key={name}>{name}</option>)}
        </Select>
      </div>
      <Field label="Materiales usados" name="materials_used" />
      <TextArea label="Problemas encontrados" name="problems" />
      <TextArea label="Solucion aplicada" name="solution" />
      <TextArea label="Tareas pendientes" name="pending_tasks" />
      <ErrorLine state={state} />
      <SubmitButton label="Guardar actividad" pendingLabel="Guardando..." />
    </form>
  );
}

export function JobMaterialForm({ jobId, materials }: { jobId: string; materials: Material[] }) {
  const [state, action] = useFormState(assignJobMaterial, null);
  useForm<z.infer<typeof jobMaterialSchema>>({ resolver: zodResolver(jobMaterialSchema) });
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="job_id" value={jobId} />
      <Select label="Material" name="material_id" required>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>{material.name}</option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cantidad" name="quantity" type="number" min="0" step="0.01" required />
        <Field label="Costo unitario" name="unit_cost" type="number" min="0" step="0.01" />
      </div>
      <ErrorLine state={state} />
      <SubmitButton label="Imputar material" pendingLabel="Guardando..." />
    </form>
  );
}

export function AttachmentForm({ jobId }: { jobId: string }) {
  const [state, action] = useFormState(uploadAttachment, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="module" value="jobs" />
      <input type="hidden" name="record_id" value={jobId} />
      <Field label="Etiqueta" name="label" placeholder="Antes, durante, comprobante..." />
      <label className="grid gap-2 text-sm text-white/72">
        <span>Archivo o foto</span>
        <input className="min-h-12 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-mint file:px-3 file:py-2 file:text-ink" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" required />
      </label>
      <ErrorLine state={state} />
      <SubmitButton label="Subir archivo" pendingLabel="Subiendo..." />
    </form>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? pendingLabel : label}</Button>;
}
