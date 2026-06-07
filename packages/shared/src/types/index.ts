// ============================================
// AMIS-DT — Core Domain Types
// ============================================
// Shared domain types used by web, mobile, AI
// engine, and DB layer. Mirrors the Supabase
// schema in
// packages/db/supabase/migrations/*.sql
// ============================================

export type UserRole = "patient" | "clinician" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  sex: "male" | "female" | "other" | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_condition: string | null;
  age_band: string | null;
  baseline_mobility_score: number | null;
  created_at: string;
  updated_at: string;
}

// Pain types from migration 0002. Keep in sync with the DB enum.
export const PAIN_TYPES = [
  "sharp",
  "dull",
  "nerve",
  "spasm",
  "burning",
  "throbbing",
  "stiffness",
  "other",
] as const;
export type PainType = (typeof PAIN_TYPES)[number];

// Body regions rendered on the silhouette. Mirrors the SVG paths
// inside apps/mobile/screens/PainLogScreen.tsx.
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

// Mirror of public.pain_events (after migration 0002).
export interface PainEvent {
  id: string;
  patient_id: string;
  recorded_at: string;
  body_region: BodyRegion;
  intensity: number; // 1-10
  pain_type: PainType;
  trigger: string | null;
  side: "front" | "back";
}

// Backwards-compat alias used by the web /api/recommend route
// and the AI engine. Older code that imported PainMapEntry still
// resolves to the renamed table.
export type PainMapEntry = PainEvent;

export type JointName =
  | "shoulder_left"
  | "shoulder_right"
  | "elbow_left"
  | "elbow_right"
  | "wrist_left"
  | "wrist_right"
  | "hip_left"
  | "hip_right"
  | "knee_left"
  | "knee_right"
  | "ankle_left"
  | "ankle_right"
  | "lumbar"
  | "cervical";

export interface MobilityAssessment {
  id: string;
  patient_id: string;
  recorded_at: string;
  joint: JointName | string;
  rom_degrees: number;
  strength_score: number;
  balance_score: number;
  notes: string | null;
}

export interface RecoveryScore {
  id: string;
  patient_id: string;
  recorded_at: string;
  composite_score: number;
  mobility_score: number;
  pain_score: number;
  strength_score: number;
  adherence_score: number;
  model_version: string | null;
}

export type InterventionCategory =
  | "physical_therapy"
  | "occupational_therapy"
  | "pain_management"
  | "mobility_protocol"
  | "strength_protocol"
  | "surgical_consultation"
  | "imaging_followup"
  | "lifestyle_coaching";

export interface Intervention {
  id: string;
  patient_id: string;
  category: InterventionCategory | string;
  started_at: string;
  ended_at: string | null;
  dose: string | null;
  clinician_id: string | null;
  notes: string | null;
  outcome_score: number | null;
}

export interface AIRecommendation {
  id: string;
  patient_id: string;
  generated_at: string;
  rank: number;
  intervention_category: string;
  rationale: string;
  predicted_recovery_uplift: number;
  confidence: number;
  model_version: string;
  clinician_acknowledged_at: string | null;
  clinician_decision: "accepted" | "rejected" | "modified" | null;
}

export type ImagingModality = "mri" | "xray" | "ultrasound" | "ct";

export interface ImagingStudy {
  id: string;
  patient_id: string;
  modality: ImagingModality;
  body_region: string;
  performed_at: string;
  storage_path: string;
  report_text: string | null;
  radiologist_id: string | null;
}

export interface ClinicalRelationship {
  id: string;
  patient_id: string;
  clinician_id: string;
  started_at: string;
  ended_at: string | null;
  scope: "full" | "consult" | "imaging_review";
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_role: UserRole;
  action: string;
  target_table: string;
  target_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}
