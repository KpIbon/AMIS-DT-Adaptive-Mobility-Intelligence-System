# AMIS-DT

**Adaptive Mobility Intelligence System — Digital Twin**

A personalized rehabilitation intelligence platform. AMIS-DT builds a living
biomechanical digital twin of each patient — calibrated from pain mapping,
mobility assessments, and imaging — to forecast recovery and rank
interventions by predicted effect.

> This is a **clinical decision-support platform**, not a fitness app. Every
> output is grounded in patient-specific data and is reviewed by a clinician
> before changing treatment.

## Tech stack

- **Frontend (web)**: Next.js 15 (App Router) + TypeScript + Tailwind
- **Frontend (mobile)**: React Native + Expo + Expo Router
- **Backend / DB**: Supabase (Postgres + Auth + Storage) with Row Level Security
- **AI**: OpenAI (recommendations + embeddings)
- **Payments**: Stripe (subscriptions + webhooks)
- **Repo**: pnpm + Turborepo monorepo
- **Deploy**: Vercel (web) · EAS (mobile) · Supabase (DB)
- **CI**: GitHub Actions

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

## Getting started

```bash
# 1. Install
pnpm install

# 2. Copy env and fill in
cp .env.example apps/web/.env.local
cp .env.example apps/mobile/.env.local

# 3. Run web
pnpm dev --filter @amis-dt/web

# 4. Run mobile (separate terminal)
pnpm dev --filter @amis-dt/mobile
```

## Database setup

```bash
# 1. Create a Supabase project at supabase.com
# 2. Link it
supabase link --project-ref <your-ref>

# 3. Apply migrations
supabase db push

# 4. (optional) Seed demo data
pnpm --filter @amis-dt/db seed
```

## Status

**Phase 1 (foundation) shipped.** See `docs/ROADMAP.md` for what's next.
Phase 1 is the working vertical slice: monorepo wiring, Supabase schema with
RLS, AI engine, web landing + dashboard + `/api/recommend`, mobile home +
pain map, CI.

## Deployment

- **Web**: push to `main` → GitHub Actions → automatic Vercel build.
- **Mobile**: `eas build` once you're ready (Phase 3).

## License

Proprietary. All rights reserved.
