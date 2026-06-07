// PainLogScreen — patient-facing pain event logger.
//
// Flow:
//   1. Tap a region on the body silhouette (front/back toggle)
//   2. Select pain type: sharp | dull | nerve | spasm
//   3. Drag a 1-10 intensity slider
//   4. Optionally describe a trigger (free text)
//   5. Submit → INSERT into public.pain_events
//
// Design goals: medical-minimal, calm, fast, offline-tolerant. All
// state is local until the user hits Save. On success we route back
// to the previous screen with a success message.

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import type { BodyRegion, PainEvent, PainType } from "@amis-dt/shared";
import { supabase } from "../src/lib/supabase";
import { BodySilhouette } from "../src/components/BodySilhouette";

const PAIN_TYPES: { value: PainType; label: string; description: string }[] = [
  { value: "sharp", label: "Sharp", description: "Stabbing, localized" },
  { value: "dull", label: "Dull", description: "Aching, widespread" },
  { value: "nerve", label: "Nerve", description: "Burning, tingling, radiating" },
  { value: "spasm", label: "Spasm", description: "Cramps, involuntary tightening" },
];

const INTENSITY_LABELS: Record<number, string> = {
  1: "Barely noticeable",
  2: "Mild",
  3: "Mild",
  4: "Uncomfortable",
  5: "Uncomfortable",
  6: "Distracting",
  7: "Distressing",
  8: "Intense",
  9: "Severe",
  10: "Worst possible",
};

const HUMAN_REGION: Record<BodyRegion, string> = {
  cervical: "Neck",
  shoulder_left: "Left shoulder",
  shoulder_right: "Right shoulder",
  elbow_left: "Left elbow",
  elbow_right: "Right elbow",
  wrist_left: "Left wrist",
  wrist_right: "Right wrist",
  thoracic: "Mid back",
  lumbar: "Lower back",
  hip_left: "Left hip",
  hip_right: "Right hip",
  knee_left: "Left knee",
  knee_right: "Right knee",
  ankle_left: "Left ankle",
  ankle_right: "Right ankle",
  foot_left: "Left foot",
  foot_right: "Right foot",
};

function isInjuredType(t: PainType): string {
  return t;
}

export default function PainLogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ------- form state -------
  const [view, setView] = useState<"front" | "back">("front");
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [painType, setPainType] = useState<PainType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [trigger, setTrigger] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Switching view clears the selected region so users don't carry
  // a front selection into a back-only context.
  const onToggleView = useCallback((next: "front" | "back") => {
    setView(next);
    setRegion(null);
  }, []);

  const canSubmit = region !== null && painType !== null && !saving;

  const onSubmit = useCallback(async () => {
    if (!region || !painType) {
      Alert.alert("Almost there", "Please choose where it hurts and what it feels like.");
      return;
    }

    setSaving(true);

    // Resolve the patient_id from the current session.
    // The patient_profiles row is keyed by user_id; the patient_id
    // column on pain_events is the profile row's primary key.
    let patientId: string | null = null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        Alert.alert(
          "Not signed in",
          "Please sign in to record a pain event.",
          [{ text: "OK", onPress: () => router.replace("/auth/sign-in") }],
        );
        return;
      }
      const { data: profile, error: profileErr } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (profileErr || !profile) {
        Alert.alert(
          "No patient profile",
          "We couldn't find a patient profile on this account.",
        );
        return;
      }
      patientId = profile.id;
    } catch (e) {
      console.error("[PainLog] profile lookup failed", e);
      Alert.alert("Network error", "Couldn't reach the server. Try again in a moment.");
      return;
    }

    // Narrow the type: every code path above either returns or
    // assigns patientId. TS can't see across the try/catch, so we
    // assert here.
    const pid = patientId as string;
    const row: Omit<PainEvent, "id" | "created_at"> = {
      patient_id: pid,
      body_region: region,
      pain_type: painType,
      intensity: Math.round(intensity),
      trigger: trigger.trim() || null,
      recorded_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("pain_events").insert(row);

    setSaving(false);

    if (error) {
      console.error("[PainLog] insert failed", error);
      Alert.alert("Couldn't save", error.message ?? "Unknown error");
      return;
    }

    Alert.alert("Logged", "Your pain event was recorded.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [region, painType, intensity, trigger, view, router]);

  const intensityLabel = useMemo(
    () => INTENSITY_LABELS[Math.round(intensity)] ?? "—",
    [intensity],
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log pain</Text>
          <Text style={styles.subtitle}>
            Tap where it hurts. We'll personalize your plan around it.
          </Text>
        </View>

        {/* View toggle */}
        <View style={styles.toggleRow} accessibilityRole="tablist">
          <Pressable
            onPress={() => onToggleView("front")}
            style={[styles.toggle, view === "front" && styles.toggleActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === "front" }}
          >
            <Text style={[styles.toggleText, view === "front" && styles.toggleTextActive]}>
              Front
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onToggleView("back")}
            style={[styles.toggle, view === "back" && styles.toggleActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === "back" }}
          >
            <Text style={[styles.toggleText, view === "back" && styles.toggleTextActive]}>
              Back
            </Text>
          </Pressable>
        </View>

        {/* Silhouette card */}
        <View style={styles.silhouetteCard}>
          <BodySilhouette
            view={view}
            selected={region}
            onSelect={setRegion}
            height={360}
          />
          <Text style={styles.silhouetteHint}>
            {region ? `Selected: ${HUMAN_REGION[region]}` : "Tap a marker to choose a region"}
          </Text>
        </View>

        {/* Pain type */}
        <SectionHeader step={2} title="What does it feel like?" />
        <View style={styles.painTypeGrid}>
          {PAIN_TYPES.map((t) => {
            const active = painType === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setPainType(t.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.painTypeCard, active && styles.painTypeCardActive]}
              >
                <Text
                  style={[styles.painTypeLabel, active && styles.painTypeLabelActive]}
                >
                  {t.label}
                </Text>
                <Text style={styles.painTypeDesc}>{t.description}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Intensity */}
        <SectionHeader step={3} title="How strong is it?" />
        <View style={styles.intensityCard}>
          <View style={styles.intensityRow}>
            <Text style={styles.intensityNumber}>{Math.round(intensity)}</Text>
            <View style={styles.intensityTextCol}>
              <Text style={styles.intensityOutOf}>out of 10</Text>
              <Text style={styles.intensityLabel}>{intensityLabel}</Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={intensity}
            onValueChange={setIntensity}
            minimumTrackTintColor="#0F766E"
            maximumTrackTintColor="#CBD5E1"
            thumbTintColor="#0F766E"
            accessibilityLabel="Pain intensity"
          />
          <View style={styles.intensityScaleRow}>
            <Text style={styles.intensityScaleEnd}>1 — Mild</Text>
            <Text style={styles.intensityScaleEnd}>10 — Worst</Text>
          </View>
        </View>

        {/* Trigger */}
        <SectionHeader step={4} title="What triggered it?" optional />
        <View style={styles.triggerCard}>
          <TextInput
            value={trigger}
            onChangeText={setTrigger}
            placeholder="e.g. stairs, sitting too long, after PT"
            placeholderTextColor="#94A3B8"
            style={styles.triggerInput}
            multiline
            maxLength={280}
            accessibilityLabel="Trigger description"
          />
          <Text style={styles.triggerCounter}>{trigger.length}/280</Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit, busy: saving }}
          style={[styles.submit, !canSubmit && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {saving ? "Saving…" : canSubmit ? "Save pain event" : "Choose region and pain type"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={styles.cancel}
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({
  step,
  title,
  optional,
}: {
  step: number;
  title: string;
  optional?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.stepBubble}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {optional ? <Text style={styles.optional}>Optional</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { paddingHorizontal: 20 },

  header: { marginBottom: 16, marginTop: 4 },
  title: { fontSize: 28, fontWeight: "700", color: "#0F172A", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: "#475569", marginTop: 4, lineHeight: 20 },

  // toggle
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  toggleText: { fontSize: 14, color: "#475569", fontWeight: "500" },
  toggleTextActive: { color: "#0F172A", fontWeight: "600" },

  // silhouette
  silhouetteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
  },
  silhouetteHint: {
    textAlign: "center",
    color: "#475569",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },

  // section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  stepNumber: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A", flex: 1 },
  optional: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },

  // pain type
  painTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  painTypeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
  },
  painTypeCardActive: {
    borderColor: "#0F766E",
    borderWidth: 2,
    backgroundColor: "#F0FDFA",
  },
  painTypeLabel: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  painTypeLabelActive: { color: "#0F766E" },
  painTypeDesc: { fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 16 },

  // intensity
  intensityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  intensityRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  intensityNumber: { fontSize: 44, fontWeight: "700", color: "#0F172A", width: 72 },
  intensityTextCol: { flex: 1 },
  intensityOutOf: { fontSize: 13, color: "#64748B" },
  intensityLabel: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  slider: { width: "100%", height: 36 },
  intensityScaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  intensityScaleEnd: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },

  // trigger
  triggerCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  triggerInput: {
    minHeight: 60,
    fontSize: 15,
    color: "#0F172A",
    textAlignVertical: "top",
  },
  triggerCounter: { fontSize: 11, color: "#94A3B8", textAlign: "right" },

  // submit
  submit: {
    backgroundColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { backgroundColor: "#CBD5E1" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  cancel: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: { color: "#64748B", fontSize: 15, fontWeight: "500" },
});

// Keep lint quiet about unused helpers; useful for future expansion.
void isInjuredType;
