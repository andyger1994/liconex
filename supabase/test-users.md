# Usuarios de prueba

Supabase Auth no permite crear usuarios seguros solo con SQL desde el editor. Crea estos usuarios desde Authentication > Users y agrega el `role` en metadata, o usa el Supabase CLI.

Administrador:
- Email: admin@liconex.local
- Password: Cambiar123!
- User metadata: `{ "full_name": "Administrador Liconex", "role": "admin" }`

Tecnico:
- Email: tecnico@liconex.local
- Password: Cambiar123!
- User metadata: `{ "full_name": "Tecnico Liconex", "role": "technician" }`

El trigger `handle_new_user` copiara el rol a `public.profiles`. Si creas el usuario sin metadata, actualiza el rol manualmente:

```sql
update public.profiles set role = 'admin' where email = 'admin@liconex.local';
```
