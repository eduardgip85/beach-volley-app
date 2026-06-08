begin;

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  details text,
  language text not null default 'en',
  user_agent text,
  admin_note text,
  status text not null default 'pending',
  requested_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  constraint account_deletion_requests_email_check check (
    email = lower(trim(email)) and length(email) between 3 and 320 and email like '%@%'
  ),
  constraint account_deletion_requests_details_check check (
    details is null or length(details) <= 1000
  ),
  constraint account_deletion_requests_status_check check (
    status in ('pending', 'verified', 'completed', 'rejected')
  )
);

alter table public.account_deletion_requests
  add column if not exists admin_note text;

create index if not exists account_deletion_requests_status_requested_idx
  on public.account_deletion_requests (status, requested_at desc);

alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon, authenticated;

drop policy if exists "Admins can read account deletion requests"
  on public.account_deletion_requests;
create policy "Admins can read account deletion requests"
on public.account_deletion_requests for select to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update account deletion requests"
  on public.account_deletion_requests;
create policy "Admins can update account deletion requests"
on public.account_deletion_requests for update to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

grant select, update on public.account_deletion_requests to authenticated;

create or replace function public.request_account_deletion(
  p_email text,
  p_details text default null,
  p_language text default 'en',
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email is null
    or length(normalized_email) < 3
    or length(normalized_email) > 320
    or normalized_email not like '%@%'
  then
    raise exception 'A valid email is required';
  end if;

  if exists (
    select 1
    from public.account_deletion_requests
    where email = normalized_email
      and requested_at > timezone('utc', now()) - interval '24 hours'
  ) then
    return;
  end if;

  insert into public.account_deletion_requests (email, details, language, user_agent)
  values (
    normalized_email,
    nullif(left(trim(coalesce(p_details, '')), 1000), ''),
    left(coalesce(nullif(trim(p_language), ''), 'en'), 10),
    left(coalesce(p_user_agent, ''), 500)
  );
end;
$$;

revoke all on function public.request_account_deletion(text, text, text, text) from public;
grant execute on function public.request_account_deletion(text, text, text, text) to anon, authenticated;

commit;
