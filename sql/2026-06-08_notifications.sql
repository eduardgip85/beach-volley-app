begin;

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  push_enabled boolean not null default false,
  friends_enabled boolean not null default true,
  events_enabled boolean not null default true,
  results_enabled boolean not null default true,
  tournaments_enabled boolean not null default true,
  product_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  category text not null,
  type text not null,
  title_key text not null,
  body_key text not null,
  data jsonb not null default '{}'::jsonb,
  deep_link text,
  dedupe_key text unique,
  read_at timestamptz,
  push_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint notifications_category_check check (
    category in ('friends', 'events', 'results', 'tournaments', 'product')
  ),
  constraint notifications_deep_link_check check (
    deep_link is null or deep_link like '/%'
  )
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "Users can read their notifications" on public.notifications;
create policy "Users can read their notifications"
on public.notifications for select to authenticated
using (recipient_id = auth.uid());

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
on public.notifications for update to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

drop policy if exists "Users can delete their notifications" on public.notifications;
create policy "Users can delete their notifications"
on public.notifications for delete to authenticated
using (recipient_id = auth.uid());

drop policy if exists "Users can read their notification preferences" on public.notification_preferences;
create policy "Users can read their notification preferences"
on public.notification_preferences for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create their notification preferences" on public.notification_preferences;
create policy "Users can create their notification preferences"
on public.notification_preferences for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their notification preferences" on public.notification_preferences;
create policy "Users can update their notification preferences"
on public.notification_preferences for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, update, delete on public.notifications to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;

create or replace function public.notification_category_enabled(
  target_user_id uuid,
  target_category text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.in_app_enabled and case target_category
        when 'friends' then p.friends_enabled
        when 'events' then p.events_enabled
        when 'results' then p.results_enabled
        when 'tournaments' then p.tournaments_enabled
        when 'product' then p.product_enabled
        else true
      end
      from public.notification_preferences p
      where p.user_id = target_user_id
    ),
    true
  );
$$;

create or replace function public.create_notification(
  target_recipient_id uuid,
  target_actor_id uuid,
  target_category text,
  target_type text,
  target_title_key text,
  target_body_key text,
  target_data jsonb,
  target_deep_link text,
  target_dedupe_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_recipient_id is null
    or target_recipient_id = target_actor_id
    or not public.notification_category_enabled(target_recipient_id, target_category)
  then
    return;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    category,
    type,
    title_key,
    body_key,
    data,
    deep_link,
    dedupe_key
  )
  values (
    target_recipient_id,
    target_actor_id,
    target_category,
    target_type,
    target_title_key,
    target_body_key,
    coalesce(target_data, '{}'::jsonb),
    target_deep_link,
    target_dedupe_key
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

create or replace function public.notify_friend_request_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    select full_name into actor_name from public.profiles where id = new.requester_id;
    perform public.create_notification(
      new.receiver_id, new.requester_id, 'friends', 'friend_request_received',
      'notifications.items.friendRequestReceivedTitle',
      'notifications.items.friendRequestReceivedBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player')),
      '/friends', 'friend_request:received:' || new.id::text
    );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'accepted' then
    select full_name into actor_name from public.profiles where id = new.receiver_id;
    perform public.create_notification(
      new.requester_id, new.receiver_id, 'friends', 'friend_request_accepted',
      'notifications.items.friendRequestAcceptedTitle',
      'notifications.items.friendRequestAcceptedBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player')),
      '/friends', 'friend_request:accepted:' || new.id::text
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_event_invitation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  event_title text;
begin
  select title into event_title from public.events where id = new.event_id;

  if tg_op = 'INSERT' and new.status = 'pending' then
    select full_name into actor_name from public.profiles where id = new.inviter_id;
    perform public.create_notification(
      new.invitee_id, new.inviter_id, 'events', 'event_invitation_received',
      'notifications.items.eventInvitationTitle',
      'notifications.items.eventInvitationBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player'), 'eventTitle', coalesce(event_title, 'Event')),
      '/events/' || new.event_id::text, 'event_invitation:received:' || new.id::text
    );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('accepted', 'declined') then
    select full_name into actor_name from public.profiles where id = new.invitee_id;
    perform public.create_notification(
      new.inviter_id, new.invitee_id, 'events', 'event_invitation_' || new.status,
      'notifications.items.eventInvitationResponseTitle',
      'notifications.items.eventInvitationResponseBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player'), 'eventTitle', coalesce(event_title, 'Event'), 'status', new.status),
      '/events/' || new.event_id::text, 'event_invitation:' || new.status || ':' || new.id::text
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_event_join_request_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  event_title text;
  event_owner_id uuid;
begin
  select title, created_by into event_title, event_owner_id
  from public.events where id = new.event_id;

  if (tg_op = 'INSERT' and new.status = 'pending')
    or (tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'pending')
  then
    select full_name into actor_name from public.profiles where id = new.requester_id;
    perform public.create_notification(
      event_owner_id, new.requester_id, 'events', 'event_join_request_received',
      'notifications.items.eventJoinRequestTitle',
      'notifications.items.eventJoinRequestBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player'), 'eventTitle', coalesce(event_title, 'Event')),
      '/events/' || new.event_id::text, 'event_join_request:pending:' || new.id::text
    );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('accepted', 'rejected') then
    perform public.create_notification(
      new.requester_id, event_owner_id, 'events', 'event_join_request_' || new.status,
      'notifications.items.eventJoinRequestResponseTitle',
      'notifications.items.eventJoinRequestResponseBody',
      jsonb_build_object('eventTitle', coalesce(event_title, 'Event'), 'status', new.status),
      '/events/' || new.event_id::text, 'event_join_request:' || new.status || ':' || new.id::text
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_match_result_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_title text;
  participant_id uuid;
begin
  select title into event_title from public.events where id = new.event_id;

  if (tg_op = 'INSERT' and new.validation_status = 'pending')
    or (tg_op = 'UPDATE' and old.validation_status is distinct from new.validation_status and new.validation_status = 'pending')
  then
    for participant_id in
      select mp.user_id
      from public.match_players mp
      where mp.event_id = new.event_id
        and mp.status in ('joined', 'confirmed')
        and mp.user_id <> new.submitted_by
    loop
      perform public.create_notification(
        participant_id, new.submitted_by, 'results', 'match_result_pending',
        'notifications.items.matchResultPendingTitle',
        'notifications.items.matchResultPendingBody',
        jsonb_build_object('eventTitle', coalesce(event_title, 'Match')),
        '/events/' || new.event_id::text, 'match_result:pending:' || new.id::text || ':' || participant_id::text
      );
    end loop;
  elsif tg_op = 'UPDATE' and old.validation_status is distinct from new.validation_status and new.validation_status in ('accepted', 'rejected') then
    for participant_id in
      select mp.user_id
      from public.match_players mp
      where mp.event_id = new.event_id
        and mp.status in ('joined', 'confirmed')
        and mp.user_id <> coalesce(new.validated_by, new.submitted_by)
    loop
      perform public.create_notification(
        participant_id, new.validated_by, 'results', 'match_result_' || new.validation_status,
        'notifications.items.matchResultUpdatedTitle',
        'notifications.items.matchResultUpdatedBody',
        jsonb_build_object('eventTitle', coalesce(event_title, 'Match'), 'status', new.validation_status),
        '/events/' || new.event_id::text, 'match_result:' || new.validation_status || ':' || new.id::text || ':' || participant_id::text
      );
    end loop;
  end if;
  return new;
end;
$$;

create or replace function public.notify_tournament_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_id_value uuid;
  event_title text;
  team_name_value text;
  actor_name text;
begin
  select te.event_id, te.team_name, e.title
  into event_id_value, team_name_value, event_title
  from public.tournament_entries te
  join public.events e on e.id = te.event_id
  where te.id = new.entry_id;

  if tg_op = 'INSERT' and new.status = 'pending' then
    select full_name into actor_name from public.profiles where id = new.invited_by;
    perform public.create_notification(
      new.user_id, new.invited_by, 'tournaments', 'tournament_team_invitation',
      'notifications.items.tournamentInvitationTitle',
      'notifications.items.tournamentInvitationBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player'), 'eventTitle', coalesce(event_title, 'Tournament'), 'teamName', coalesce(team_name_value, 'Team')),
      '/events/' || event_id_value::text, 'tournament_member:pending:' || new.id::text
    );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('accepted', 'declined') then
    select full_name into actor_name from public.profiles where id = new.user_id;
    perform public.create_notification(
      new.invited_by, new.user_id, 'tournaments', 'tournament_team_invitation_' || new.status,
      'notifications.items.tournamentInvitationResponseTitle',
      'notifications.items.tournamentInvitationResponseBody',
      jsonb_build_object('actorName', coalesce(actor_name, 'Sandset player'), 'eventTitle', coalesce(event_title, 'Tournament'), 'status', new.status),
      '/events/' || event_id_value::text, 'tournament_member:' || new.status || ':' || new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_friend_request_change on public.friend_requests;
create trigger notify_friend_request_change
after insert or update of status on public.friend_requests
for each row execute function public.notify_friend_request_change();

drop trigger if exists notify_event_invitation_change on public.event_invitations;
create trigger notify_event_invitation_change
after insert or update of status on public.event_invitations
for each row execute function public.notify_event_invitation_change();

drop trigger if exists notify_event_join_request_change on public.event_join_requests;
create trigger notify_event_join_request_change
after insert or update of status on public.event_join_requests
for each row execute function public.notify_event_join_request_change();

drop trigger if exists notify_match_result_change on public.match_results;
create trigger notify_match_result_change
after insert or update of validation_status on public.match_results
for each row execute function public.notify_match_result_change();

drop trigger if exists notify_tournament_member_change on public.tournament_entry_members;
create trigger notify_tournament_member_change
after insert or update of status on public.tournament_entry_members
for each row execute function public.notify_tournament_member_change();

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

commit;
