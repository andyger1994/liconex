import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-mint">Liconex</p>
        <h1 className="mt-3 text-4xl font-black">Gestion tecnica movil</h1>
        <p className="mt-3 text-white/66">Trabajos, horas, gastos, cobros y rentabilidad desde el telefono.</p>
      </div>
      <section className="glass rounded-3xl p-5">
        <LoginForm />
        <Link href="/reset-password" className="mt-5 block text-center text-sm text-mint">
          Recuperar contrasena
        </Link>
      </section>
    </main>
  );
}
