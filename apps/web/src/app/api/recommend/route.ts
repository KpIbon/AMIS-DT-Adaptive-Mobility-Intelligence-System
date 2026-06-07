// API route: AI recommendation engine
// POST /api/recommend
// Body: { patientId }
// Returns: ranked interventions for the patient.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { recommendInterventions } from "@amis-dt/ai";
import type { PainEvent, MobilityAssessment, RecoveryScore, PatientProfile } from "@amis-dt/shared";

const Body = z.object({ patientId: z.string().uuid() });

export async function POST(req: NextRequest) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body. Expected { patientId: uuid }." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: pain }, { data: mobility }, { data: scores }] = await Promise.all([
    supabase
      .from("patient_profiles")
      .select("*")
      .eq("id", body.patientId)
      .single<PatientProfile>(),
    supabase
      .from("pain_events")
      .select("*")
      .eq("patient_id", body.patientId)
      .order("recorded_at", { ascending: false })
      .limit(10)
      .returns<PainEvent[]>(),
    supabase
      .from("mobility_assessments")
      .select("*")
      .eq("patient_id", body.patientId)
      .order("recorded_at", { ascending: false })
      .limit(10)
      .returns<MobilityAssessment[]>(),
    supabase
      .from("recovery_scores")
      .select("*")
      .eq("patient_id", body.patientId)
      .order("recorded_at", { ascending: false })
      .limit(20)
      .returns<RecoveryScore[]>(),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const { recommendations, model_version } = await recommendInterventions({
    patient: profile,
    recentPain: pain ?? [],
    recentMobility: mobility ?? [],
    recentScores: scores ?? [],
  });

  // Persist. Failures here should not block the response; we still
  // return the recommendations to the caller.
  const { error: persistErr } = await supabase.from("ai_recommendations").insert(
    recommendations.map(({ id: _id, ...rest }) => rest),
  );
  if (persistErr) {
    console.error("[/api/recommend] persist failed:", persistErr);
  }

  return NextResponse.json({ recommendations, model_version });
}
