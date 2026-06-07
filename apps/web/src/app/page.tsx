import Link from "next/link";
import { APP_FULL_NAME, APP_TAGLINE } from "@amis-dt/shared";
import { CLINICAL_STATS } from "../content/landing";

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-cyan-400">AMIS-DT</p>
      <h1 className="mt-3 text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
        {APP_FULL_NAME}
        <br />
        <span className="text-cyan-400">{APP_TAGLINE}</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-zinc-400">
        A living biomechanical digital twin for every patient. Calibrated from
        pain mapping, mobility assessments, and imaging — used to forecast
        recovery and rank the interventions that matter for this specific body.
      </p>

      <div className="mt-10 flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-cyan-400 text-zinc-950 font-medium hover:bg-cyan-300 transition"
        >
          Open patient dashboard
        </Link>
        <a
          href="https://github.com/KpIbon/AMIS-DT-Adaptive-Mobility-Intelligence-System"
          className="inline-flex items-center px-5 py-3 rounded-xl border border-zinc-700 text-zinc-200 hover:border-zinc-500 transition"
        >
          GitHub
        </a>
      </div>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {CLINICAL_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <p className="text-3xl font-semibold text-white">{s.value}</p>
            <p className="mt-2 text-sm text-zinc-400">{s.label}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
