# Liconex

Aplicacion web movil para gestion integral de instalaciones, mantenimiento, camaras, alarmas, control de acceso, redes y trabajos tecnicos.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Database, Auth y Storage
- React Hook Form + Zod
- Recharts
- Lucide Icons
- Preparada para PWA con `manifest.webmanifest`

## Modulos incluidos

- Autenticacion con Supabase Auth.
- Rutas protegidas y layout movil.
- Roles `admin` y `technician`.
- Dashboard conectado a Supabase.
- Trabajos con alta, listado y ficha de detalle.
- Actividades, materiales y adjuntos por trabajo.
- Clientes con contacto por telefono, WhatsApp y Google Maps.
- Trabajadores con ficha basica y costos.
- Control horario con inicio/fin de jornada.
- Gastos con categorias iniciales y aprobacion pendiente.
- Cobros e informes con graficos.
- Agenda conectada a trabajos, vencimientos, garantias y mantenimientos.
- Inventario con stock, alertas y movimientos.
- Vehiculos con kilometraje, services y traslados.
- SQL completo con tablas, indices, triggers, RLS, buckets Storage y seeds.

## Instalacion local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Crea un proyecto en Supabase y completa `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. En Supabase SQL Editor ejecuta `supabase/schema.sql`.

5. Crea los usuarios siguiendo `supabase/test-users.md`.

6. Ejecuta:

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Despliegue en Vercel

Ver tambien `DEPLOY.md`.

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Configura las variables de entorno reales de Supabase.
4. En Supabase Auth agrega la URL de Vercel en Site URL y Redirect URLs.
5. Despliega.

## Seguridad

La interfaz oculta acciones segun rol, pero la seguridad real esta en Supabase:

- RLS activado en todas las tablas principales.
- Los tecnicos solo leen trabajos asignados, sus horas y sus gastos.
- Los administradores gestionan clientes, empleados, finanzas, reportes y aprobaciones.
- Storage queda privado y limitado a usuarios autenticados/propietarios/admin.
- Los datos administrativos tienen borrado logico mediante `deleted_at`.
- Cambios relevantes quedan registrados en `audit_logs`.
