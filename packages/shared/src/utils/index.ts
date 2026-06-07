// ============================================
// AMIS-DT — Shared Utilities
// ============================================

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function painToRecoveryPenalty(intensity: number, max = 10): number {
  // 0 pain -> 0 penalty, max pain -> 50 penalty
  const i = clamp(intensity, 0, max);
  return (i / max) * 50;
}

export function computeCompositeScore(input: {
  mobility: number; // 0-100
  pain: number; // 0-10
  strength: number; // 0-100
  adherence: number; // 0-100
}): number {
  // Weighted composite: mobility + strength + adherence minus pain penalty.
  const raw = input.mobility * 0.35 + input.strength * 0.3 + input.adherence * 0.35;
  const penalty = painToRecoveryPenalty(input.pain);
  return Math.round(clamp(raw - penalty + 50, 0, 100));
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
