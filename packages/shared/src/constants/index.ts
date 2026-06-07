// ============================================
// AMIS-DT — Shared Constants
// ============================================

export const APP_NAME = "AMIS-DT";
export const APP_FULL_NAME = "Adaptive Mobility Intelligence System";
export const APP_TAGLINE = "Digital Twin";

// Pain scale
export const PAIN_MIN = 0;
export const PAIN_MAX = 10;

// Recovery score bounds
export const RECOVERY_SCORE_MIN = 0;
export const RECOVERY_SCORE_MAX = 100;

// AI model version label (mirrored on the server side).
export const AI_MODEL_VERSION = "amis-dt-recommend-1.0.0";

// Pain types from migration 0002. Keep in sync with the DB enum.
export const PAIN_TYPES = [
  "sharp",
  "dull",
  "nerve",
  "spasm",
  "burning",
  "throbbi",
] as const;

export type PainType = (typeof PAIN_TYPES)[number];

// Body regions used by the pain map. Keep in sync with the mobile UI
// and any future body-silhouette image.
export const BODY_REGIONS = [
  "cervical",
  "shoulder_left",
  "shoulder_right",
  "elbow_left",
  "elbow_right",
  "wrist_left",
  "wrist_right",
  "thoracic",
  "lumbar",
  "hip_left",
  "hip_right",
  "knee_left",
  "knee_right",
  "ankle_left",
  "ankle_right",
  "foot_left",
  "foot_right",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

// Subscriptions. We don't read process.env here because this
// package is consumed by the mobile app (React Native) where
// `process` may not be defined. Server-side apps (Next.js,
// scripts) should read the env var themselves and inject the
// resolved price ID, or override these constants before import.
const ENV: Record<string, string | undefined> = ((): Record<string, string | undefined> => {
  try {
    // Works in Node / Next.js server runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process?.env ?? {};
  } catch {
    return {};
  }
})();

export const STRIPE_PRICE_PATIENT_MONTHLY =
  ENV.STRIPE_PRICE_PATIENT_MONTHLY as string | undefined;
export const STRIPE_PRICE_CLINICIAN_SEAT =
  ENV.STRIPE_PRICE_CLINICIAN_SEAT as string | undefined;
