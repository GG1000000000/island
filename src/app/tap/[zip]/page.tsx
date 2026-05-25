import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ZipInput } from "../zip-input";

export const dynamic = "force-dynamic";

async function getZip(zip: string) {
  const { data } = await supabase
    .from("zip_risk")
    .select("*")
    .eq("zip", zip)
    .maybeSingle();
  return data;
}

const LSL_TIER_LABEL = [
  "unknown",
  "low",
  "low-medium",
  "medium",
  "medium-high",
  "high",
];

const LSL_TIER_DESCRIPTION: Record<number, string> = {
  1: "Lower projected lead service line inventory at the state level. Your individual home may still have lead pipes; this is a population-level estimate.",
  2: "Lower-to-medium projected LSL inventory.",
  3: "Medium projected LSL inventory.",
  4: "Higher projected LSL inventory at the state level.",
  5: "States with the largest known LSL inventories (NY, IL, OH). Higher background prevalence; individual homes still vary.",
};

export default async function TapZipPage({
  params,
}: {
  params: Promise<{ zip: string }>;
}) {
  const { zip: rawZip } = await params;
  const clean = rawZip.replace(/\D/g, "").padStart(5, "0").slice(-5);
  if (!/^\d{5}$/.test(clean)) notFound();
  const data = await getZip(clean);
  if (!data) notFound();

  const pre1950 = data.pre1950 ?? 0;
  const b1950s = data.b1950s ?? 0;
  const b1960s = data.b1960s ?? 0;
  const b1970s = data.b1970s ?? 0;
  const b1980s = data.b1980s ?? 0;
  const total = data.total_units ?? 0;
  // pre-1978 (the lead-paint ban year). We have decadal buckets, so approximate
  // by assuming 1970s is fully pre-1978 (since the ban took effect 1978-01-01).
  const pre1978 = pre1950 + b1950s + b1960s + b1970s;
  const pctPre1978 = total > 0 ? (pre1978 / total) * 100 : 0;
  const pctPre1950 = total > 0 ? (pre1950 / total) * 100 : 0;
  const lslTier = data.lsl_tier ?? 0;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-10 pb-16">
      <Link
        href="/tap"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        tap water search
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-1">
        ZIP {clean}
      </h1>
      <div className="text-stone-600 mb-8">
        {data.place ?? "(no place name)"}, {data.state ?? "?"}
        {total > 0 && (
          <>
            {" · "}
            <span className="tabular-nums">{total.toLocaleString()}</span> housing units
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="text-xs uppercase tracking-wide text-stone-900 font-medium mb-3">
            Lead paint risk (housing age)
          </h3>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            {pctPre1978.toFixed(1)}%
          </div>
          <div className="text-sm text-stone-500">of homes built before 1978</div>
          <div className="text-xs text-stone-500 mt-1">
            ({pctPre1950.toFixed(1)}% before 1950 — highest paint risk)
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <Row label="Pre-1950" n={pre1950} total={total} />
            <Row label="1950s" n={b1950s} total={total} />
            <Row label="1960s" n={b1960s} total={total} />
            <Row label="1970s" n={b1970s} total={total} />
            <Row label="1980s" n={b1980s} total={total} />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="text-xs uppercase tracking-wide text-stone-900 font-medium mb-3">
            Lead service line risk ({data.state ?? "state"})
          </h3>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            tier {lslTier || "?"}
          </div>
          <div className="text-sm text-stone-500">
            of 5 ({LSL_TIER_LABEL[lslTier] ?? "unknown"})
          </div>
          <p className="text-xs text-stone-600 mt-3 leading-relaxed">
            {LSL_TIER_DESCRIPTION[lslTier] ??
              "No EPA LSL tier assigned for this state."}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-stone-100/60 border border-stone-200 p-5 mb-8">
        <h3 className="text-xs uppercase tracking-wide text-stone-900 font-medium mb-2">
          What this means
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          Pre-1978 homes can have lead-based paint on interior trim, doors, and
          windows. Pre-1986 plumbing can have lead solder. Pre-1950 homes are
          highest risk for both.
        </p>
        <p className="text-sm text-stone-600 leading-relaxed mt-2">
          This is structural risk only (housing stock + state-level LSL data).
          For an actual water test, ask your utility for the annual Consumer
          Confidence Report (CCR), which is legally public, or buy a certified
          lab kit. For paint, a swab test or XRF scan answers fast.
        </p>
      </div>

      <h3 className="text-xs uppercase tracking-wide text-stone-900 font-medium mb-3">
        Check another ZIP
      </h3>
      <ZipInput />

      <p className="mt-10 text-xs text-stone-500">
        Sources: US Census ACS 2022 housing age (B25034 / B25035) by ZCTA, EPA
        2025 Update to the 7th DWINSA (state lead service line projections, bucketed
        into 5 tiers).
      </p>
    </main>
  );
}

function Row({ label, n, total }: { label: string; n: number; total: number }) {
  const pct = total > 0 ? (n / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 text-stone-600">{label}</div>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-stone-400" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="w-16 text-right tabular-nums text-stone-700">{n.toLocaleString()}</div>
      <div className="w-12 text-right tabular-nums text-stone-400">{pct.toFixed(0)}%</div>
    </div>
  );
}
