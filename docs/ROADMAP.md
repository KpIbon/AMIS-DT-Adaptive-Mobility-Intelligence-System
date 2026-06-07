# AMIS-DT — Build Roadmap

## Phase 1 — Foundation (DONE in this push)

- [x] Monorepo scaffold (pnpm + Turborepo)
- [x] `@amis-dt/shared` (types, constants, utils)
- [x] `@amis-dt/db` (Supabase schema, RLS, seed)
- [x] `@amis-dt/ai` (recommendation engine, prompt, embeddings stub)
- [x] `@amis-dt/web` Next.js 15 — landing, patient dashboard placeholder, `/api/recommend`, `/api/stripe-webhook`
- [x] `@amis-dt/mobile` Expo Router — home screen, pain map logging
- [x] CI: typecheck + build on PR
- [x] Docs: architecture, data model, this roadmap

## Phase 2 — Auth + working dashboards

- [ ] Supabase email/password + OAuth (Apple, Google) on web
- [ ] Supabase Auth on mobile (Expo SecureStore session)
- [ ] Real patient dashboard: scores, history chart, recent interventions
- [ ] Clinician dashboard: patient list, cohort trends
- [ ] Pain map → DB persistence (web + mobile)
- [ ] Mobility assessment form (web + mobile)
- [ ] `/api/recommend` end-to-end with persisted data

## Phase 3 — Digital Twin + Imaging

- [ ] 3D body model (R3F on web, react-native-three on mobile)
- [ ] Twin calibration from pain map + mobility + imaging
- [ ] Twin displays: ROM constraints, pain heatmap, load tolerance
- [ ] Imaging upload (MRI/x-ray/ultrasound) with metadata + storage paths
- [ ] Imaging viewer

## Phase 4 — AI maturity

- [ ] Similar-patient matching (embeddings + vector search)
- [ ] Recovery trajectory forecast (not just intervention rank)
- [ ] Counterfactual explanation: "why this rank?"
- [ ] Model versioning + eval harness

## Phase 5 — Monetization

- [ ] Stripe Checkout for patient subscription
- [ ] Stripe Customer Portal
- [ ] Webhook handlers (checkout completed, subscription updated)
- [ ] Clinician seat-based pricing
- [ ] Usage-based pricing for AI recommendations

## Phase 6 — Clinical validation

- [ ] HIPAA/GDPR review
- [ ] Audit log UI for clinicians
- [ ] BAA-ready infrastructure
- [ ] Clinician onboarding flow
- [ ] Outcome studies export
