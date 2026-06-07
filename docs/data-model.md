# AMIS-DT — Data Model

The schema lives in `packages/db/supabase/migrations/0001_init.sql` and is
mirrored as TypeScript types in `packages/shared/src/types/index.ts`.

## ERD (logical)

```
auth.users (Supabase managed)
      │
      │ 1:1
      ▼
public.users (role, profile)
      │
      ├──── patient ──► patient_profiles
      │                       │
      │                       ├── pain_map
      │                       ├── mobility_assessments
      │                       ├── recovery_scores
      │                       ├── imaging_studies
      │                       ├── interventions
      │                       └── ai_recommendations
      │
      └──── clinician ──► clinical_relationships ──► patients
```

## Tables

| Table                       | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `users`                     | Role + profile, 1:1 with `auth.users`                  |
| `patient_profiles`          | Demographics, conditions, baseline mobility            |
| `pain_map`                  | Per-region pain intensity over time                    |
| `mobility_assessments`      | ROM, gait, strength, balance measurements              |
| `recovery_scores`           | Composite recovery metric per visit                    |
| `imaging_studies`           | Metadata for MRI/x-ray/ultrasound uploads              |
| `interventions`             | What the patient actually did (PT, exercise, etc.)     |
| `ai_recommendations`        | AI-suggested intervention ranks + rationale            |
| `clinical_relationships`    | Patient ↔ clinician access mapping                     |
| `audit_log`                 | Append-only log of every clinical write                 |

## Security

- RLS is enabled on every clinical table.
- Patients: full access to their own rows.
- Clinicians: read access to patients linked via `clinical_relationships`.
- Admin: emergency access, audited.

## Migrations

Apply in order with the Supabase CLI:

```bash
supabase db push   # uses packages/db/supabase/migrations/*
```

## Seed

`pnpm --filter @amis-dt/db seed` inserts a demo clinician + patient with
sample pain, mobility, and recovery data. Requires `SUPABASE_SERVICE_ROLE_KEY`.
