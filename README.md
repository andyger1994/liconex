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

## Modulos incluidos en este MVP

- Autenticacion con Supabase Auth.
- Rutas protegidas y layout movil.
- Roles `admin` y `technician`.
- Dashboard conectado a Supabase.
- Trabajos con alta y listado.
- Clientes con alta, contacto por telefono, WhatsApp y Google Maps.
- Trabajadores con ficha basica y costos.
- Control horario con inicio/fin de jornada.
- Gastos con categorias iniciales y aprobacion pendiente.
- Cobros e informes con graficos.
- Agenda movil conectada a trabajos, vencimientos, garantias y mantenimientos.`r`n- Inventario con stock, alertas y movimientos demo/SQL.`r`n- Vehiculos con kilometraje, services y traslados demo/SQL.
- SQL completo con tablas, indices, triggers, RLS, buckets Storage y seeds.

## Instalacion local

### Abrir en modo demo, sin Supabase

El proyecto ya incluye `.env.local` con:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Con eso podÃ©s abrir la app sin crear base de datos:

```bash
npm.cmd install
npm.cmd run dev
```

DespuÃ©s entrÃ¡ a `http://localhost:3000`. PodÃ©s usar cualquier correo y contraseÃ±a en el login demo; por ejemplo:

```txt
demo@liconex.local
demo123
```

Los formularios en modo demo no guardan cambios permanentes: sirven para recorrer pantallas, diseÃ±o y flujo. Para usar datos reales, cambia `NEXT_PUBLIC_DEMO_MODE=false`, completa las claves de Supabase y ejecuta `supabase/schema.sql`.

### Usar con Supabase real

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Crea un proyecto en Supabase y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. En Supabase SQL Editor ejecuta:

```sql
-- contenido de supabase/schema.sql
```

5. Crea los usuarios de prueba siguiendo `supabase/test-users.md`.

6. Ejecuta:

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Despliegue en Vercel

Ver tambien `DEPLOY.md`.

1. Sube el proyecto a un repositorio.
2. Importa el repositorio en Vercel.
3. Configura las mismas variables de entorno.
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

## Siguientes fases

- Completar formularios de materiales, inventario, vehiculos y traslados.
- Agregar actividades diarias con fotos por trabajo.
- Exportar PDF y CSV desde server actions.
- Agregar compresion de imagenes antes de subir a Storage.
- Crear cierres mensuales programados.
- Mejorar vistas dia/semana/mes del calendario.

