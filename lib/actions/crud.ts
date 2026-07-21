"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { attachmentSchema, clientSchema, employeeSchema, expenseSchema, jobActivitySchema, jobMaterialSchema, jobSchema, paymentSchema } from "@/lib/schemas/common";

function value(formData: FormData, key: string) {
  return formData.get(key) ? String(formData.get(key)) : undefined;
}

function emptyToNull<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(Object.entries(row).map(([key, val]) => [key, val === "" || val === undefined ? null : val]));
}

export async function createClientRecord(_: unknown, formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  const { error } = await supabase.from("clients").insert(emptyToNull(parsed.data));
  if (error) return { error: error.message };
  revalidatePath("/clients");
  redirect("/clients");
}

export async function createEmployee(_: unknown, formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  const { error } = await supabase.from("employees").insert(emptyToNull(parsed.data));
  if (error) return { error: error.message };
  revalidatePath("/employees");
  redirect("/employees");
}

export async function createJob(_: unknown, formData: FormData) {
  const { profile } = await requireRole(["admin"]);
  const supabase = await createClient();
  const parsed = jobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  const payload = emptyToNull({
    ...parsed.data,
    code: `LIC-${Date.now().toString().slice(-7)}`,
    created_by: profile?.id,
    real_cost: 0,
    real_minutes: 0
  });
  const { error } = await supabase.from("jobs").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/jobs");
  redirect("/jobs");
}

export async function createExpense(_: unknown, formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  const { error } = await supabase.from("expenses").insert(
    emptyToNull({
      ...parsed.data,
      registered_by: profile?.id,
      approval_status: "pending"
    })
  );
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function createPayment(_: unknown, formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  const { error } = await supabase.from("payments").insert(emptyToNull(parsed.data));
  if (error) return { error: error.message };
  revalidatePath("/reports");
  redirect("/reports");
}

export async function startWorkSession(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const jobId = value(formData, "job_id");
  const { error } = await supabase.from("work_sessions").insert(
    emptyToNull({
      user_id: profile?.id,
      job_id: jobId,
      started_at: new Date().toISOString(),
      approval_status: "pending",
      notes: value(formData, "notes")
    })
  );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/time");
}

export async function finishWorkSession(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const sessionId = String(formData.get("session_id") ?? "");
  const { error } = await supabase
    .from("work_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", profile?.id)
    .is("ended_at", null);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/time");
}

export async function createJobActivity(_: unknown, formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const parsed = jobActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const { error } = await supabase.from("job_activities").insert(
    emptyToNull({
      ...parsed.data,
      technician_id: profile?.id,
      activity_at: new Date().toISOString()
    })
  );
  if (error) return { error: error.message };
  revalidatePath(`/jobs/${parsed.data.job_id}`);
  redirect(`/jobs/${parsed.data.job_id}`);
}

export async function assignJobMaterial(_: unknown, formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const parsed = jobMaterialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const { error: relationError } = await supabase.from("job_materials").insert({
    ...parsed.data,
    created_by: profile?.id
  });
  if (relationError) return { error: relationError.message };

  const { error: movementError } = await supabase.from("inventory_movements").insert({
    material_id: parsed.data.material_id,
    job_id: parsed.data.job_id,
    movement_type: "salida",
    quantity: parsed.data.quantity,
    unit_cost: parsed.data.unit_cost,
    created_by: profile?.id
  });
  if (movementError) return { error: movementError.message };

  revalidatePath(`/jobs/${parsed.data.job_id}`);
  revalidatePath("/materials");
  redirect(`/jobs/${parsed.data.job_id}`);
}

export async function uploadAttachment(_: unknown, formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const parsed = attachmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona un archivo" };
  if (file.size > 10 * 1024 * 1024) return { error: "El archivo no puede superar 10 MB" };

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) return { error: "Formato no permitido" };

  const extension = file.name.split(".").pop() ?? "bin";
  const bucket = file.type.startsWith("image/") ? "job-photos" : "attachments";
  const path = `${parsed.data.module}/${parsed.data.record_id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("attachments").insert({
    bucket,
    path,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    module: parsed.data.module,
    record_id: parsed.data.record_id,
    uploaded_by: profile?.id
  });
  if (insertError) return { error: insertError.message };

  revalidatePath(`/jobs/${parsed.data.record_id}`);
  redirect(`/jobs/${parsed.data.record_id}`);
}
