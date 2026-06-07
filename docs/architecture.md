# AMIS-DT — Architecture

## Mission

AMIS-DT builds a **living biomechanical digital twin** for each patient, calibrated
from pain mapping, mobility assessments, and imaging, and uses that twin to
**forecast recovery** and **rank interventions** by predicted effect.

## Layers

```
┌──────────────────────────────────────────────────────────┐
│  Apps (web Next.js · mobile React Native/Expo)           │
│  → Patient & Clinician surfaces                          │
├──────────────────────────────────────────────────────────┤
│  AI engine (@amis-dt/ai)                                 │
│  → Recommendation · Embeddings · Prompts                 │
├──────────────────────────────────────────────────────────┤
│  Shared (@amis-dt/shared)                                │
│  → Domain types · Constants · Utilities                  │
├──────────────────────────────────────────────────────────┤
│  Database (@amis-dt/db → Supabase)                       │
│  → Postgres + Auth + Storage · RLS · Audit log           │
└──────────────────────────────────────────────────────────┘
```

## Monorepo layout

```
amis-dt/
├── apps/
│   ├── mobile/        # React Native (Expo Router)
│   └── web/           # Next.js 15 App Router
├── packages/
│   ├── ai/            # AI logic · prompts · embeddings
│   ├── db/            # Supabase schema, migrations, seed
│   └── shared/        # Types, constants, utils
├── docs/              # Architecture, data model, roadmap
└── .github/workflows/ # CI
```

## Data flow (recommend endpoint)

1. Web client posts `{ patientId }` to `/api/recommend`.
2. Web route authenticates via Supabase session.
3. Server fetches the patient profile, recent pain entries, recent mobility
   assessments, recent recovery scores.
4. `@amis-dt/ai` calls OpenAI with the structured patient snapshot + a
   schema-constrained prompt, returning ranked `Recommendation` objects.
5. Server persists recommendations to `ai_recommendations` (audit log captures
   the model version + input hash).
6. Response is returned to the client.

## Auth

- Patients and clinicians share a single Supabase project.
- `auth.users` is mirrored by a `public.users` row holding the `role` and
  profile fields.
- **Row Level Security** is the source of truth: patients can only read/write
  their own data; clinicians can read all patients they have a
  `clinical_relationship` with.
- Admin role exists for emergency access; all admin reads/writes are logged.

## Audit

Every write to a clinical table goes through a Postgres trigger that inserts
a row into `audit_log`. This is the only way to satisfy clinical
accountability for a tool that influences a treatment plan.

## Deployment

- **Web**: Vercel (root `apps/web`). `vercel.json` wires build commands into
  the monorepo.
- **Mobile**: Expo EAS (when ready — Phase 3).
- **Database**: Supabase hosted Postgres. Migrations in
  `packages/db/supabase/migrations/` are applied via the Supabase CLI.
- **CI**: GitHub Actions. Runs typecheck + build on every PR.
