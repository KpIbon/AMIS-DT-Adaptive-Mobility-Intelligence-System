import { Link } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { APP_FULL_NAME, APP_TAGLINE } from "@amis-dt/shared";

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#0a0a0b" }}
      contentContainerStyle={{ padding: 24, gap: 16 }}
    >
      <Text style={{ color: "#22d3ee", fontSize: 12, letterSpacing: 2 }}>
        AMIS-DT
      </Text>
      <Text style={{ color: "#f5f5f4", fontSize: 36, fontWeight: "600" }}>
        {APP_FULL_NAME}
      </Text>
      <Text style={{ color: "#22d3ee", fontSize: 28, fontWeight: "600" }}>
        {APP_TAGLINE}
      </Text>
      <Text style={{ color: "#a1a1aa", fontSize: 16, lineHeight: 24 }}>
        Your digital twin — calibrated from your pain, mobility, and imaging
        data — forecasts your recovery and ranks the interventions most likely
        to help your body specifically.
      </Text>

      <View style={{ marginTop: 12, gap: 12 }}>
        <Link href="/log-pain" asChild>
          <Pressable
            style={{
              backgroundColor: "#22d3ee",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#0a0a0b", fontWeight: "600" }}>
              Log a pain event
            </Text>
          </Pressable>
        </Link>
        <View
          style={{
            backgroundColor: "#18181b",
            borderColor: "#27272a",
            borderWidth: 1,
            padding: 16,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#a1a1aa", fontSize: 12, letterSpacing: 1 }}>
            RECOVERY SCORE
          </Text>
          <Text
            style={{
              color: "#f5f5f4",
              fontSize: 48,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            64
          </Text>
          <Text style={{ color: "#71717a", fontSize: 13 }}>
            Last recorded 2 days ago
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
