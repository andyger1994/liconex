"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "No se pudo iniciar sesion. Revisa correo y contrasena." };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_: unknown, formData: FormData) {
  return sendPasswordReset(formData);
}

export async function requestPasswordResetDirect(formData: FormData) {
  await sendPasswordReset(formData);
}

async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: "No se pudo enviar el correo de recuperacion." };
  return { success: "Te enviamos un enlace para recuperar la contrasena." };
}
