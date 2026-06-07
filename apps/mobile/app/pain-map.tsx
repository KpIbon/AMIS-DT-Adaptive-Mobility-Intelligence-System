// Minimal pain-map logging screen — vertical slice of the patient
// input loop. Real implementation will draw a body silhouette and
// store entries to Supabase in Phase 2.

import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { BODY_REGIONS, PAIN_MAX, PAIN_MIN, type BodyRegion } from "@amis-dt/shared";

const QUALITIES = ["sharp", "dull", "burning", "aching", "throbbing", "stiffness"];

export default function PainMapScreen() {
  const [region, setRegion] = useState<BodyRegion>("lumbar");
  const [intensity, setIntensity] = useState(5);
  const [quality, setQuality] = useState<string>("aching");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function onSave() {
    // Phase 2: persist to Supabase via the shared client factory.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0b" }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text style={{ color: "#f5f5f4", fontSize: 24, fontWeight: "600" }}>
        Log a pain entry
      </Text>

      <View>
        <Text style={{ color: "#a1a1aa", marginBottom: 6 }}>Region</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {BODY_REGIONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRegion(r)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: region === r ? "#22d3ee" : "#27272a",
                backgroundColor: region === r ? "#0e2a2e" : "transparent",
              }}
            >
              <Text style={{ color: region === r ? "#22d3ee" : "#a1a1aa" }}>
                {r.replace("_", " ")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ color: "#a1a1aa", marginBottom: 6 }}>
          Intensity ({PAIN_MIN}–{PAIN_MAX})
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: PAIN_MAX + 1 }, (_, i) => i).map((n) => (
            <Pressable
              key={n}
              onPress={() => setIntensity(n)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: intensity === n ? "#22d3ee" : "#27272a",
                backgroundColor: intensity === n ? "#0e2a2e" : "transparent",
              }}
            >
              <Text style={{ color: intensity === n ? "#22d3ee" : "#a1a1aa" }}>
                {n}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ color: "#a1a1aa", marginBottom: 6 }}>Quality</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUALITIES.map((q) => (
            <Pressable
              key={q}
              onPress={() => setQuality(q)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: quality === q ? "#22d3ee" : "#27272a",
                backgroundColor: quality === q ? "#0e2a2e" : "transparent",
              }}
            >
              <Text style={{ color: quality === q ? "#22d3ee" : "#a1a1aa" }}>
                {q}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ color: "#a1a1aa", marginBottom: 6 }}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Anything that makes it better or worse?"
          placeholderTextColor="#52525b"
          style={{
            minHeight: 80,
            backgroundColor: "#18181b",
            borderColor: "#27272a",
            borderWidth: 1,
            borderRadius: 12,
            color: "#f5f5f4",
            padding: 12,
            textAlignVertical: "top",
          }}
        />
      </View>

      <Pressable
        onPress={onSave}
        style={{
          backgroundColor: "#22d3ee",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#0a0a0b", fontWeight: "600" }}>
          {saved ? "Saved ✓" : "Save entry"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
