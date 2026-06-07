-- ============================================
-- AMIS-DT — Initial Schema
-- ============================================
-- Migration 0001: core domain tables
-- See /docs/data-model.md for ERD
-- ============================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- USERS (mirrors auth.users with role/profile)
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('patient', 'clinician', 'admin')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PATIENT PROFILES
-- ============================================
create table if not exists public.patient_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  date_of_birth date,
  sex text check (sex in ('male', 'female', 'other')),
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  primary_condition text,
  baseline_mobility_score integer check (baseline_mobility_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PAIN MAP
-- ============================================
create table if not exists public.pain_map (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  body_region text not null,
  intensity integer not null check (intensity between 0 and 10),
  quality text,
  notes text
);
create index if not exists pain_map_patient_time_idx
  on public.pain_map (patient_id, recorded_at desc);

-- ============================================
-- MOBILITY ASSESSMENTS
-- ============================================
create table if not exists public.mobility_assessments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  joint text not null,
  rom_degrees numeric(5,1),
  strength_score integer check (strength_score between 0 and 100),
  balance_score integer check (balance_score between 0 and 100),
  notes text
);
create index if not exists mobility_patient_time_idx
  on public.mobility_assessments (patient_id, recorded_at desc);

-- ============================================
-- RECOVERY SCORES
-- ============================================
create table if not exists public.recovery_scores (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  composite_score integer not null check (composite_score between 0 and 100),
  mobility_score integer not null check (mobility_score between 0 and 100),
  pain_score integer not null check (pain_score between 0 and 10),
  strength_score integer not null check (strength_score between 0 and 100),
  adherence_score integer not null check (adherence_score between 0 and 100),
  model_version text
);
create index if not exists recovery_patient_time_idx
  on public.recovery_scores (patient_id, recorded_at desc);

-- ============================================
-- INTERVENTIONS
-- ============================================
create table if not exists public.interventions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  category text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  dose text,
  clinician_id uuid references public.users(id),
  notes text,
  outcome_score integer check (outcome_score between 0 and 100)
);
create index if not exists interventions_patient_idx
  on public.interventions (patient_id, started_at desc);

-- ============================================
-- AI RECOMMENDATIONS
-- ============================================
create table if not exists public.ai_recommendations (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  generated_at timestamptz not null default now(),
  rank integer not null,
  intervention_category text not null,
  rationale text not null,
  predicted_recovery_uplift integer not null,
  confidence numeric(3,2) not null,
  model_version text not null,
  clinician_acknowledged_at timestamptz,
  clinician_decision text check (clinician_decision in ('accepted', 'rejected', 'modified'))
);
create index if not exists ai_recs_patient_time_idx
  on public.ai_recommendations (patient_id, generated_at desc);

-- ============================================
-- IMAGING STUDIES
-- ============================================
create table if not exists public.imaging_studies (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  modality text not null check (modality in ('mri', 'xray', 'ultrasound', 'ct')),
  body_region text not null,
  performed_at timestamptz not null,
  storage_path text not null,
  report_text text,
  radiologist_id uuid references public.users(id)
);

-- ============================================
-- CLINICAL RELATIONSHIPS
-- ============================================
create table if not exists public.clinical_relationships (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  clinician_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  scope text not null check (scope in ('full', 'consult', 'imaging_review'))
);
create index if not exists clinical_rel_clinician_idx
  on public.clinical_relationships (clinician_id) where ended_at is null;
create index if not exists clinical_rel_patient_idx
  on public.clinical_relationships (patient_id) where ended_at is null;

-- ============================================
-- AUDIT LOG
-- ============================================
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.users(id),
  actor_role text,
  action text not null,
  target_table text not null,
  target_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_target_idx
  on public.audit_log (target_table, target_id, created_at desc);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger patient_profiles_updated_at
  before update on public.patient_profiles
  for each row execute function public.set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.pain_map enable row level security;
alter table public.mobility_assessments enable row level security;
alter table public.recovery_scores enable row level security;
alter table public.interventions enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.imaging_studies enable row level security;
alter table public.clinical_relationships enable row level security;
alter table public.audit_log enable row level security;

-- Patients: full access to their own profile + clinical data.
create policy "patient reads own profile"
  on public.patient_profiles for select
  using (user_id = auth.uid());

create policy "patient updates own profile"
  on public.patient_profiles for update
  using (user_id = auth.uid());

create policy "patient reads own pain"
  on public.pain_map for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient inserts own pain"
  on public.pain_map for insert
  with check (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient reads own mobility"
  on public.mobility_assessments for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient reads own recovery scores"
  on public.recovery_scores for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient reads own interventions"
  on public.interventions for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient reads own ai recs"
  on public.ai_recommendations for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

create policy "patient reads own imaging"
  on public.imaging_studies for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid()));

-- Clinicians: read access to linked patients.
create policy "clinician reads linked patient profile"
  on public.patient_profiles for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = patient_profiles.id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked pain"
  on public.pain_map for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = pain_map.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked mobility"
  on public.mobility_assessments for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = mobility_assessments.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked recovery scores"
  on public.recovery_scores for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = recovery_scores.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked interventions"
  on public.interventions for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = interventions.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked ai recs"
  on public.ai_recommendations for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = ai_recommendations.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician updates linked ai rec decision"
  on public.ai_recommendations for update
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = ai_recommendations.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  )
  with check (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = ai_recommendations.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician inserts interventions for linked patients"
  on public.interventions for insert
  with check (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = interventions.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

create policy "clinician reads linked imaging"
  on public.imaging_studies for select
  using (
    exists (
      select 1 from public.clinical_relationships cr
      where cr.patient_id = imaging_studies.patient_id
        and cr.clinician_id = auth.uid()
        and cr.ended_at is null
    )
  );

-- Clinical relationships: visible to both parties.
create policy "user reads own relationships"
  on public.clinical_relationships for select
  using (patient_id in (select id from public.patient_profiles where user_id = auth.uid())
         or clinician_id = auth.uid());

-- Audit log: read-only for clinicians, no public read.
create policy "clinician reads audit for linked patients"
  on public.audit_log for select
  using (
    actor_id = auth.uid()
    or exists (
      select 1 from public.clinical_relationships cr
      where cr.clinician_id = auth.uid()
        and cr.ended_at is null
        and (
          cr.patient_id::text = (audit_log.after->>'patient_id')
          or cr.patient_id::text = (audit_log.before->>'patient_id')
        )
    )
  );
