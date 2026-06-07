// Builds the LLM prompt for intervention ranking.

import type {
  PatientProfile,
  PainMapEntry,
  MobilityAssessment,
  RecoveryScore,
} from "@amis-dt/shared";
import type { RecommendInput } from "../src/recommend";

export function buildRecommendPrompt(input: RecommendInput): string {
  const { patient, recentPain, recentMobility, recentScores, knownConditions } = input;

  return `You are ranking rehabilitation interventions for ONE patient.

PATIENT
- Age band: ${patient.age_band ?? "unknown"}
- Primary condition: ${patient.primary_condition ?? "unspecified"}
- Known conditions: ${(knownConditions ?? []).join(", ") || "none provided"}

RECENT PAIN (most recent first, up to 10)
${recentPain
    .map(
      (p: PainMapEntry) =>
        `- ${p.recorded_at} | region=${p.body_region} | intensity=${p.intensity}/10 | quality=${p.quality ?? "n/a"}`,
    )
    .join("\n")}

RECENT MOBILITY (most recent first, up to 10)
${recentMobility
    .map(
      (m: MobilityAssessment) =>
        `- ${m.recorded_at} | ${m.joint} | ROM=${m.rom_degrees}° | strength=${m.strength_score}/100 | balance=${m.balance_score}/100`,
    )
    .join("\n")}

RECENT RECOVERY SCORES
${recentScores
    .map(
      (s: RecoveryScore) =>
        `- ${s.recorded_at} | composite=${s.composite_score}/100 | mobility=${s.mobility_score} | pain=${s.pain_score} | strength=${s.strength_score} | adherence=${s.adherence_score}`,
    )
    .join("\n")}

TASK
Return 1–5 ranked interventions. For each: a category, a 1–3 sentence rationale citing the data above, predicted recovery uplift (0–50 score points), and confidence (0–1).

Do not invent data. If something is missing, say so in the rationale.

Output JSON of the form:
{
  "recommendations": [
    {
      "rank": 1,
      "intervention_category": "...",
      "rationale": "...",
      "predicted_recovery_uplift": 0,
      "confidence": 0
    }
  ]
}`;
}
