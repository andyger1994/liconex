# Deploy real

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Crea los usuarios de prueba indicados en `supabase/test-users.md`.
4. En Storage confirma que existen los buckets privados `attachments` y `job-photos`.

## Variables

En local y en Vercel usa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

## Git

```bash
git remote add origin TU_REPOSITORIO
git push -u origin main
```

## Vercel

1. Importa el repo en Vercel.
2. Carga las variables anteriores.
3. Despliega.
4. Copia la URL final en Supabase Auth > URL Configuration.
