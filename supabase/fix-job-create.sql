create or replace function public.capture_job_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.job_status_history (job_id, old_status, new_status, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop policy if exists "status history insert from job trigger" on public.job_status_history;
create policy "status history insert from job trigger"
on public.job_status_history
for insert
with check (auth.uid() is not null);
