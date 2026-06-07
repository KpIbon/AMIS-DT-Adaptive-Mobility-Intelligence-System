// Body silhouette with tappable regions.
// Front and back views share the same BodyRegion set but have
// different anatomy: the front shows chest/abdomen, the back shows
// spine/scapulae. We use small circular hit-targets for each region
// rather than full silhouette paths because the goal is precise
// tapping, not art.
//
// ViewBox: 200 wide x 400 tall, head at top.
//
// Usage:
//   <BodySilhouette
//     view="front"
//     selected={selectedRegion}
//     onSelect={(r) => setSelectedRegion(r)}
//   />

import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Svg, { G, Circle, Path, Rect } from "react-native-svg";
import type { BodyRegion } from "@amis-dt/shared";
import { BODY_REGIONS } from "@amis-dt/shared";

export type BodyView = "front" | "back";

export interface BodySilhouetteProps {
  view: BodyView;
  selected?: BodyRegion | null;
  onSelect?: (region: BodyRegion) => void;
  height?: number;
  accentColor?: string;
  baseColor?: string;
  selectedColor?: string;
  outlineColor?: string;
}

const VB_WIDTH = 200;
const VB_HEIGHT = 400;

// Region hit-target coordinates (cx, cy, r) per view.
// Roughly anatomical. Each region gets a circle of radius r=10 —
// large enough to tap comfortably, small enough to disambiguate.
type RegionCoord = { cx: number; cy: number; r: number };

const FRONT_COORDS: Record<BodyRegion, RegionCoord> = {
  cervical: { cx: 100, cy: 40, r: 11 },
  shoulder_left: { cx: 70, cy: 90, r: 10 },
  shoulder_right: { cx: 130, cy: 90, r: 10 },
  elbow_left: { cx: 52, cy: 160, r: 9 },
  elbow_right: { cx: 148, cy: 160, r: 9 },
  wrist_left: { cx: 44, cy: 220, r: 8 },
  wrist_right: { cx: 156, cy: 220, r: 8 },
  thoracic: { cx: 100, cy: 130, r: 12 },
  lumbar: { cx: 100, cy: 180, r: 12 },
  hip_left: { cx: 84, cy: 230, r: 10 },
  hip_right: { cx: 116, cy: 230, r: 10 },
  knee_left: { cx: 80, cy: 300, r: 10 },
  knee_right: { cx: 120, cy: 300, r: 10 },
  ankle_left: { cx: 78, cy: 360, r: 9 },
  ankle_right: { cx: 122, cy: 360, r: 9 },
  foot_left: { cx: 78, cy: 385, r: 8 },
  foot_right: { cx: 122, cy: 385, r: 8 },
};

// Back view: same coords, but lumbar and thoracic move slightly,
// and the wrists drop a bit (arm hangs straight down from shoulder).
const BACK_COORDS: Record<BodyRegion, RegionCoord> = {
  ...FRONT_COORDS,
  thoracic: { cx: 100, cy: 130, r: 12 },
  lumbar: { cx: 100, cy: 185, r: 12 },
  wrist_left: { cx: 46, cy: 222, r: 8 },
  wrist_right: { cx: 154, cy: 222, r: 8 },
};

// Stylized body outline (front).  Simple shapes; not anatomically
// perfect, but recognizable. Drawn behind the tap-targets.
function BodyOutline({ view, stroke }: { view: BodyView; stroke: string }) {
  // Common silhouette: head circle, neck, torso, arms, legs.
  // Front and back differ only in torso fill direction.
  return (
    <G stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <Circle cx={100} cy={30} r={18} />
      {/* Neck */}
      <Path d="M 90 50 Q 100 56 110 50" />
      {/* Torso */}
      <Path
        d={
          view === "front"
            ? "M 70 70 Q 100 60 130 70 L 132 210 Q 100 220 68 210 Z"
            : "M 70 70 Q 100 60 130 70 L 132 210 Q 100 220 68 210 Z"
        }
      />
      {/* Arms */}
      <Path d="M 70 80 Q 50 130 44 220" />
      <Path d="M 130 80 Q 150 130 156 220" />
      {/* Legs */}
      <Path d="M 80 215 Q 75 280 78 360 L 80 392" />
      <Path d="M 120 215 Q 125 280 122 360 L 120 392" />
    </G>
  );
}

export function BodySilhouette({
  view,
  selected = null,
  onSelect,
  height = 420,
  accentColor = "#0F766E",
  baseColor = "#0EA5E9",
  selectedColor = "#DC2626",
  outlineColor = "#475569",
}: BodySilhouetteProps) {
  const coords = view === "front" ? FRONT_COORDS : BACK_COORDS;

  const regions = useMemo(() => BODY_REGIONS, []);

  return (
    <View style={[styles.container, { height }]}>
      <Svg
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <Rect x={0} y={0} width={VB_WIDTH} height={VB_HEIGHT} fill="transparent" />
        <BodyOutline view={view} stroke={outlineColor} />
        {regions.map((region) => {
          const c = coords[region];
          const isSelected = selected === region;
          return (
            <G key={region}>
              <Circle
                cx={c.cx}
                cy={c.cy}
                r={c.r + 2}
                fill={isSelected ? selectedColor : baseColor}
                fillOpacity={isSelected ? 0.35 : 0.12}
                stroke={isSelected ? selectedColor : accentColor}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              <Circle
                cx={c.cx}
                cy={c.cy}
                r={3}
                fill={isSelected ? selectedColor : accentColor}
                fillOpacity={0.9}
              />
            </G>
          );
        })}
      </Svg>
      {/* Transparent Pressable overlays so taps land on the circles
          even where SVG touch-handling is flaky. */}
      {regions.map((region) => {
        const c = coords[region];
        return (
          <Pressable
            key={region}
            onPress={() => onSelect?.(region)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`Select ${region.replace(/_/g, " ")}`}
            style={[
              styles.hitTarget,
              {
                // Convert SVG coords to a positioned absolute overlay.
                // hitSlop handles the size; we just place the center.
                left: `${(c.cx / VB_WIDTH) * 100}%`,
                top: `${(c.cy / VB_HEIGHT) * 100}%`,
                width: 0,
                height: 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  hitTarget: {
    position: "absolute",
  },
});
