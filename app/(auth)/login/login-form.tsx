"use client";

import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres")
});

export function LoginForm() {
  const [state, action] = useFormState(signIn, null);
  const { register, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  });

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm text-white/72">
        <span>Correo electronico</span>
        <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 focus-within:border-mint">
          <Mail size={18} className="text-mint" />
          <input className="w-full bg-transparent text-base outline-none" type="email" autoComplete="email" {...register("email")} />
        </span>
        {formState.errors.email ? <span className="text-xs text-danger">{formState.errors.email.message}</span> : null}
      </label>
      <label className="grid gap-2 text-sm text-white/72">
        <span>Contrasena</span>
        <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 focus-within:border-mint">
          <LockKeyhole size={18} className="text-mint" />
          <input className="w-full bg-transparent text-base outline-none" type="password" autoComplete="current-password" {...register("password")} />
        </span>
        {formState.errors.password ? <span className="text-xs text-danger">{formState.errors.password.message}</span> : null}
      </label>
      {state?.error ? <p className="rounded-2xl bg-danger/15 p-3 text-sm text-danger">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? "Ingresando..." : "Ingresar"}</Button>;
}
