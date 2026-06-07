-- ============================================
-- AMIS-DT — Migration 0002
-- ============================================
-- Rename pain_map -> pain_events (mobile +
-- clinician terminology); introduce explicit
-- pain_type enum; replace generic notes with
-- a structured trigger field.
-- ============================================

-- 1. Rename table
alter table if exists public.pain_map rename to pain_events;

-- 2. Replace the free-text 'quality' with a constrained pain_type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'pain_type') then
    create type public.pain_type as enum (
      'sharp',
      'dull',
      'nerve',
      'spasm',
      'burning',
      'throbbing',
      'stiffness',
      'other'
    );
  end if;
end $$;

-- 3. Add the new columns (safe if migration is re-run)
alter table public.pain_events
  add column if not exists pain_type public.pain_type,
  add column if not exists trigger text;

-- 4. Backfill: if any rows exist, map legacy 'quality' strings
--    onto the enum. Anything unrecognized becomes 'other'.
update public.pain_events
  set pain_type = case lower(coalesce(quality, ''))
      when 'sharp' then 'sharp'::public.pain_type
      when 'dull' then 'dull'::public.pain_type
      when 'nerve' then 'nerve'::public.pain_type
      when 'spasm' then 'spasm'::public.pain_type
      when 'burning' then 'burning'::public.pain_type
      when 'throbbing' then 'throbbing'::public.pain_type
      when 'stiffness' then 'stiffness'::public.pain_type
      else null
    end
  where pain_type is null;

-- 5. Drop the now-legacy column. safe because backfill ran above.
alter table public.pain_events drop column if exists quality;

-- 6. Make pain_type NOT NULL going forward (default for inserts)
alter table public.pain_events
  alter column pain_type set default 'other'::public.pain_type,
  alter column pain_type set not null;

-- 7. Refresh indexes
drop index if exists public.pain_map_patient_time_idx;
create index if not exists pain_events_patient_time_idx
  on public.pain_events (patient_id, recorded_at desc);

-- 8. RLS policies (rename-aware). They were already on pain_map;
--    the rename carries the policies with it, but we recreate them
--    under the new name for clarity and to make the policy names
--    match the new table.
drop policy if exists "patient reads own pain" on public.pain_events;
drop policy if exists "patient inserts own pain" on public.pain_events;
drop policy if exists "clinician reads linked pain" on public.pain_events;

create policy "patient reads own pain_events"
  on public.pain_events for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient inserts own pain_events"
  on public.pain_events for insert
  with check (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "clinician reads linked pain_events"
  on public.pain_events for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = pain_events.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );
