// Patient dashboard. Phase 1 placeholder that proves the monorepo
// wiring (shared types import, Tailwind, dark theme). Real data
// arrives in Phase 2 once Supabase auth is wired in.

import Link from "next/link";
import { formatDate, RECOVERY_SCORE_MAX, PAIN_MAX } from "@amis-dt/shared";

export const dynamic = "force-dynamic";

export default function PatientDashboard() {
  const lastScore = {
    score: 64,
    mobility: 58,
    pain: 4,
    strength: 62,
    adherence: 88,
    recorded_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Dashboard</p>
          <h1 className="text-3xl font-semibold mt-1">Your recovery</h1>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-cyan-400 transition"
        >
          ← Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Recovery score" value={`${lastScore.score}`} suffix={`/${RECOVERY_SCORE_MAX}`} />
        <Card label="Mobility" value={`${lastScore.mobility}`} suffix="/100" />
        <Card label="Pain" value={`${lastScore.pain}`} suffix={`/${PAIN_MAX}`} />
        <Card label="Strength" value={`${lastScore.strength}`} suffix="/100" />
        <Card label="Adherence" value={`${lastScore.adherence}`} suffix="%" />
        <Card label="Last update" value={formatDate(lastScore.recorded_at)} small />
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Phase 1 placeholder. Phase 2 wires real Supabase auth + data and adds the
        pain map, mobility assessment, and intervention history.
      </p>
    </main>
  );
}

function Card({
  label,
  value,
  suffix,
  small,
}: {
  label: string;
  value: string;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-2 font-semibold text-white ${small ? "text-lg" : "text-4xl"}`}>
        {value}
        {suffix && <span className="text-base font-normal text-zinc-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
