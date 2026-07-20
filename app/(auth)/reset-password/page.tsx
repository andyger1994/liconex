import { requestPasswordResetDirect } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-10">
      <section className="glass rounded-3xl p-5">
        <h1 className="text-2xl font-bold">Recuperar contrasena</h1>
        <form action={requestPasswordResetDirect} className="mt-5 grid gap-4">
          <Field label="Correo electronico" name="email" type="email" required />
          <Button>Enviar enlace</Button>
        </form>
      </section>
    </main>
  );
}
