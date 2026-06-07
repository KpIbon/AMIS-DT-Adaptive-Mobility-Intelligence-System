// ============================================
// AMIS-DT — Database Seed Script
// ============================================
// Run: pnpm --filter @amis-dt/db seed
// Requires SUPABASE_SERVICE_ROLE_KEY env var
// Inserts demo users + patient + sample data.
// ============================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Seeding AMIS-DT demo data...");

  // Create demo patient user
  const { data: patientAuth, error: pErr } = await supabase.auth.admin.createUser({
    email: "patient@amis-dt.demo",
    password: "demo-password-change-me",
    email_confirm: true,
  });
  if (pErr && !pErr.message.includes("already")) throw pErr;

  const { data: clinicianAuth, error: cErr } = await supabase.auth.admin.createUser({
    email: "clinician@amis-dt.demo",
    password: "demo-password-change-me",
    email_confirm: true,
  });
  if (cErr && !cErr.message.includes("already")) throw cErr;

  if (patientAuth?.user && clinicianAuth?.user) {
    // Insert users rows
    await supabase.from("users").upsert([
      { id: patientAuth.user.id, email: patientAuth.user.email!, role: "patient", full_name: "Demo Patient" },
      { id: clinicianAuth.user.id, email: clinicianAuth.user.email!, role: "clinician", full_name: "Dr. Demo" },
    ]);

    // Insert patient profile assigned to clinician
    const { data: profile } = await supabase
      .from("patient_profiles")
      .upsert(
        {
          user_id: patientAuth.user.id,
          primary_condition: "post-ACL reconstruction",
          surgery_date: "2026-04-15",
          clinician_id: clinicianAuth.user.id,
          height_cm: 175,
          weight_kg: 72,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (profile) {
      // Sample pain map entry
      await supabase.from("pain_map").insert({
        patient_id: profile.id,
        body_region: "knee_left",
        intensity: 4,
        notes: "Mild ache after long walks",
      });

      // Sample mobility assessment
      await supabase.from("mobility_assessments").insert({
        patient_id: profile.id,
        joint: "knee_left",
        range_of_motion_deg: 95,
        pain_with_motion: 3,
      });

      // Sample recovery score
      await supabase.from("recovery_scores").insert({
        patient_id: profile.id,
        score: 62,
        mobility: 65,
        pain: 70,
        strength: 55,
        adherence: 88,
      });
    }
  }

  console.log("Seed complete.");
  console.log("Login: patient@amis-dt.demo / demo-password-change-me");
  console.log("Login: clinician@amis-dt.demo / demo-password-change-me");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
