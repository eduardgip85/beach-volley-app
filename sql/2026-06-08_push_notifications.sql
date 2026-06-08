begin;

create table if not exists public.push_devices (
  token text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint push_devices_platform_check check (platform in ('android', 'ios'))
);

create index if not exists push_devices_user_enabled_idx
  on public.push_devices (user_id, enabled);

alter table public.push_devices enable row level security;

drop policy if exists "Users can read their push devices" on public.push_devices;
create policy "Users can read their push devices"
on public.push_devices for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can register their push devices" on public.push_devices;
create policy "Users can register their push devices"
on public.push_devices for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their push devices" on public.push_devices;
create policy "Users can update their push devices"
on public.push_devices for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can remove their push devices" on public.push_devices;
create policy "Users can remove their push devices"
on public.push_devices for delete to authenticated
using (user_id = auth.uid());

grant select, insert, update, delete on public.push_devices to authenticated;

commit;
