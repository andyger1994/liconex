create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace) then
    create type public.app_role as enum ('admin', 'technician');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status' and typnamespace = 'public'::regnamespace) then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.app_role not null default 'technician',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'technician'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin'::public.app_role;
$$;

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Liconex',
  tax_id text,
  phone text,
  email text,
  address text,
  default_currency text not null default 'UYU',
  workday_start time default '08:00',
  workday_end time default '17:00',
  overtime_after_minutes integer default 480,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  document text,
  phone text,
  email text,
  address text,
  role public.app_role not null default 'technician',
  position text,
  specialty text,
  hire_date date,
  is_active boolean not null default true,
  contract_type text,
  hourly_rate numeric(12,2) not null default 0,
  overtime_rate numeric(12,2) not null default 0,
  monthly_salary numeric(12,2) not null default 0,
  regular_work_days text[],
  regular_schedule text,
  emergency_contact text,
  photo_url text,
  notes text,
  admin_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  phone text,
  whatsapp text,
  email text,
  address text,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  contact_person text,
  client_type text not null default 'empresa',
  notes text,
  pending_debt numeric(12,2) not null default 0,
  total_billed numeric(12,2) not null default 0,
  total_collected numeric(12,2) not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  client_id uuid references public.clients(id) on delete set null,
  address text not null,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  service_type text not null,
  description text,
  status text not null default 'nuevo',
  priority text not null default 'media',
  scheduled_date date,
  scheduled_time time,
  started_at timestamptz,
  finished_at timestamptz,
  due_date date,
  responsible_id uuid references public.employees(id),
  budget_code text,
  agreed_price numeric(12,2) not null default 0,
  advance_amount numeric(12,2) not null default 0,
  payment_method text,
  estimated_cost numeric(12,2) not null default 0,
  real_cost numeric(12,2) not null default 0,
  estimated_minutes integer not null default 0,
  real_minutes integer not null default 0,
  warranty_until date,
  next_maintenance date,
  internal_notes text,
  client_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  is_lead boolean not null default false,
  created_at timestamptz not null default now(),
  unique (job_id, employee_id)
);

create table public.job_activities (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  technician_id uuid references public.profiles(id),
  activity_at timestamptz not null default now(),
  description text not null,
  minutes_used integer not null default 0,
  status text not null default 'registrada',
  materials_used text,
  problems text,
  solution text,
  pending_tasks text,
  customer_signature_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_minutes integer not null default 0,
  normal_minutes integer not null default 0,
  overtime_minutes integer not null default 0,
  night_minutes integer not null default 0,
  holiday_minutes integer not null default 0,
  labor_cost numeric(12,2) not null default 0,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  notes text,
  approval_status public.approval_status not null default 'pending',
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.breaks (
  id uuid primary key default gen_random_uuid(),
  work_session_id uuid not null references public.work_sessions(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  spent_at timestamptz not null default now(),
  registered_by uuid references public.profiles(id),
  category_id uuid not null references public.expense_categories(id),
  subcategory text,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'UYU',
  exchange_rate numeric(12,4),
  payment_method text not null,
  job_id uuid references public.jobs(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  supplier text,
  vehicle_id uuid,
  receipt_url text,
  approval_status public.approval_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  paid_at date not null default current_date,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'UYU',
  payment_method text not null,
  installment_number integer,
  total_installments integer,
  income_type text default 'pago_final',
  status text not null default 'cobrado',
  receipt_url text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  brand text,
  model text,
  code text unique,
  supplier_id uuid references public.suppliers(id),
  purchase_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  unit text not null default 'unidad',
  current_stock numeric(12,2) not null default 0,
  minimum_stock numeric(12,2) not null default 0,
  location text,
  purchase_date date,
  warranty_until date,
  notes text,
  photo_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  movement_type text not null,
  quantity numeric(12,2) not null,
  unit_cost numeric(12,2) not null default 0,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.job_materials (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  material_id uuid not null references public.materials(id),
  quantity numeric(12,2) not null,
  unit_cost numeric(12,2) not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text not null unique,
  brand text,
  model text,
  year integer,
  fuel_type text,
  odometer_km numeric(12,2) not null default 0,
  estimated_consumption numeric(12,2),
  insurance_due date,
  tax_due date,
  next_service_km numeric(12,2),
  next_oil_change_km numeric(12,2),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.expenses add constraint expenses_vehicle_fk foreign key (vehicle_id) references public.vehicles(id) on delete set null;

create table public.vehicle_trips (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  vehicle_id uuid not null references public.vehicles(id),
  driver_id uuid references public.employees(id),
  trip_date date not null default current_date,
  start_km numeric(12,2) not null,
  end_km numeric(12,2) not null,
  distance_km numeric(12,2) generated always as (greatest(end_km - start_km, 0)) stored,
  fuel_loaded numeric(12,2) default 0,
  cost numeric(12,2) default 0,
  tolls numeric(12,2) default 0,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'attachments',
  path text not null,
  file_name text not null,
  mime_type text,
  size_bytes integer,
  module text not null,
  record_id uuid,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  module text,
  record_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.monthly_summaries (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  total_billed numeric(12,2) not null default 0,
  total_collected numeric(12,2) not null default 0,
  total_pending numeric(12,2) not null default 0,
  total_expenses numeric(12,2) not null default 0,
  estimated_profit numeric(12,2) not null default 0,
  average_margin numeric(6,2) not null default 0,
  jobs_count integer not null default 0,
  finished_jobs integer not null default 0,
  pending_jobs integer not null default 0,
  cancelled_jobs integer not null default 0,
  worked_minutes integer not null default 0,
  overtime_minutes integer not null default 0,
  labor_cost numeric(12,2) not null default 0,
  material_cost numeric(12,2) not null default 0,
  fuel_cost numeric(12,2) not null default 0,
  distance_km numeric(12,2) not null default 0,
  opportunities jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  module text not null,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'technician'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.calculate_work_session()
returns trigger language plpgsql as $$
declare
  minutes integer;
begin
  if new.ended_at is not null then
    minutes := greatest(floor(extract(epoch from (new.ended_at - new.started_at)) / 60)::int, 0);
    new.total_minutes := minutes;
    new.normal_minutes := least(minutes, 480);
    new.overtime_minutes := greatest(minutes - 480, 0);
  end if;
  return new;
end;
$$;

create trigger work_sessions_calculate before insert or update on public.work_sessions for each row execute function public.calculate_work_session();

create or replace function public.capture_job_status_change()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.job_status_history (job_id, old_status, new_status, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger jobs_status_history after insert or update on public.jobs for each row execute function public.capture_job_status_change();

create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, module, record_id, old_value, new_value)
  values (auth.uid(), tg_op, tg_table_name, coalesce(new.id, old.id), to_jsonb(old), to_jsonb(new));
  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['clients','employees','jobs','expenses','payments','materials','vehicles'] loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.audit_row()', t, t);
  end loop;
end $$;

create index clients_search_idx on public.clients using gin (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(document,'') || ' ' || coalesce(phone,'')));
create index jobs_status_idx on public.jobs(status);
create index jobs_schedule_idx on public.jobs(scheduled_date, scheduled_time);
create index expenses_spent_at_idx on public.expenses(spent_at);
create index payments_paid_at_idx on public.payments(paid_at);
create index work_sessions_user_date_idx on public.work_sessions(user_id, started_at);
create index notifications_user_read_idx on public.notifications(user_id, read_at);

alter table public.profiles enable row level security;
alter table public.company_settings enable row level security;
alter table public.employees enable row level security;
alter table public.clients enable row level security;
alter table public.suppliers enable row level security;
alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;
alter table public.job_activities enable row level security;
alter table public.work_sessions enable row level security;
alter table public.breaks enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;
alter table public.materials enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.job_materials enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_trips enable row level security;
alter table public.attachments enable row level security;
alter table public.job_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.monthly_summaries enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles self or admin read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "settings admin all" on public.company_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "settings authenticated read" on public.company_settings for select using (auth.uid() is not null);

create policy "employees admin all" on public.employees for all using (public.is_admin()) with check (public.is_admin());
create policy "employees self read" on public.employees for select using (profile_id = auth.uid());

create policy "clients admin all" on public.clients for all using (public.is_admin()) with check (public.is_admin());
create policy "clients assigned technician read" on public.clients for select using (
  public.is_admin() or exists (
    select 1 from public.jobs j
    join public.job_assignments ja on ja.job_id = j.id
    join public.employees e on e.id = ja.employee_id
    where j.client_id = clients.id and e.profile_id = auth.uid()
  )
);

create policy "jobs admin all" on public.jobs for all using (public.is_admin()) with check (public.is_admin());
create policy "jobs assigned read" on public.jobs for select using (
  public.is_admin() or exists (
    select 1 from public.job_assignments ja
    join public.employees e on e.id = ja.employee_id
    where ja.job_id = jobs.id and e.profile_id = auth.uid()
  )
);
create policy "jobs assigned update limited" on public.jobs for update using (
  exists (
    select 1 from public.job_assignments ja
    join public.employees e on e.id = ja.employee_id
    where ja.job_id = jobs.id and e.profile_id = auth.uid()
  )
) with check (true);

create policy "assignments admin all" on public.job_assignments for all using (public.is_admin()) with check (public.is_admin());
create policy "assignments own read" on public.job_assignments for select using (
  exists (select 1 from public.employees e where e.id = employee_id and e.profile_id = auth.uid())
);

create policy "activities assigned insert" on public.job_activities for insert with check (
  public.is_admin() or technician_id = auth.uid()
);
create policy "activities visible by job" on public.job_activities for select using (
  public.is_admin() or technician_id = auth.uid() or exists (
    select 1 from public.job_assignments ja join public.employees e on e.id = ja.employee_id
    where ja.job_id = job_activities.job_id and e.profile_id = auth.uid()
  )
);

create policy "work sessions self insert" on public.work_sessions for insert with check (user_id = auth.uid());
create policy "work sessions self read" on public.work_sessions for select using (user_id = auth.uid() or public.is_admin());
create policy "work sessions self finish" on public.work_sessions for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "breaks own or admin" on public.breaks for all using (
  public.is_admin() or exists (select 1 from public.work_sessions ws where ws.id = work_session_id and ws.user_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.work_sessions ws where ws.id = work_session_id and ws.user_id = auth.uid())
);

create policy "expense categories read" on public.expense_categories for select using (auth.uid() is not null);
create policy "expense categories admin all" on public.expense_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "expenses own insert" on public.expenses for insert with check (registered_by = auth.uid() or public.is_admin());
create policy "expenses own or admin read" on public.expenses for select using (registered_by = auth.uid() or public.is_admin());
create policy "expenses admin update" on public.expenses for update using (public.is_admin()) with check (public.is_admin());

create policy "admin finance all" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "admin materials all" on public.materials for all using (public.is_admin()) with check (public.is_admin());
create policy "technician materials read" on public.materials for select using (auth.uid() is not null);
create policy "admin inventory all" on public.inventory_movements for all using (public.is_admin()) with check (public.is_admin());
create policy "job materials visible" on public.job_materials for select using (auth.uid() is not null);
create policy "job materials admin all" on public.job_materials for all using (public.is_admin()) with check (public.is_admin());
create policy "admin vehicles all" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());
create policy "technician vehicles read" on public.vehicles for select using (auth.uid() is not null);
create policy "vehicle trips own insert" on public.vehicle_trips for insert with check (auth.uid() is not null);
create policy "vehicle trips admin read" on public.vehicle_trips for select using (public.is_admin());
create policy "suppliers admin all" on public.suppliers for all using (public.is_admin()) with check (public.is_admin());
create policy "attachments own or admin" on public.attachments for all using (uploaded_by = auth.uid() or public.is_admin()) with check (uploaded_by = auth.uid() or public.is_admin());
create policy "status history visible" on public.job_status_history for select using (auth.uid() is not null);
create policy "notifications own" on public.notifications for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "monthly summaries admin" on public.monthly_summaries for all using (public.is_admin()) with check (public.is_admin());
create policy "audit admin read" on public.audit_logs for select using (public.is_admin());

insert into public.company_settings (name) values ('Liconex') on conflict do nothing;

insert into public.expense_categories (name) values
('Combustible'), ('Peajes'), ('Estacionamiento'), ('Alimentacion'), ('Materiales'), ('Herramientas'),
('Reparaciones'), ('Vehiculos'), ('Sueldos'), ('Adelantos'), ('BPS'), ('BSE'), ('DGI'), ('Contadora'),
('Alquiler'), ('Publicidad'), ('Internet'), ('Telefonia'), ('Software'), ('Imprevistos'), ('Otros')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
('attachments', 'attachments', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf','text/csv']),
('job-photos', 'job-photos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "storage authenticated upload" on storage.objects for insert with check (
  bucket_id in ('attachments', 'job-photos') and auth.uid() is not null
);
create policy "storage owner read" on storage.objects for select using (
  bucket_id in ('attachments', 'job-photos') and (owner = auth.uid() or public.is_admin())
);
create policy "storage owner update" on storage.objects for update using (
  bucket_id in ('attachments', 'job-photos') and (owner = auth.uid() or public.is_admin())
);
