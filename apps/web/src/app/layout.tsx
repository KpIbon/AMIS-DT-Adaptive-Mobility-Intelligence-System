import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMIS-DT | Adaptive Mobility Intelligence System",
  description:
    "A living biomechanical digital twin for every patient. Forecasts recovery and ranks interventions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
