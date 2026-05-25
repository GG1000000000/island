import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ContaminantSearch } from "@/components/contaminant-search";

export const dynamic = "force-dynamic";

// Hand-picked so the homepage stays predictable. Anything missing from the DB
// just renders zero entries instead of breaking.
const FEATURED_NAMES = [
  "Lead",
  "Mercury",
  "Inorganic Arsenic",
  "Cadmium",
  "Chromium VI",
  "Bisphenol A",
  "PFOA",
  "PFOS",
  "DEHP",
  "Formaldehyde",
  "Benzene",
  "Glyphosate",
];

async function fetchFeatured() {
  const { data, error } = await supabase
    .from("contaminants")
    .select("id, name, symbol, category, description")
    .in("name", FEATURED_NAMES);
  if (error) {
    console.error("featured query failed:", error);
    return [];
  }
  return data ?? [];
}

async function fetchAllContaminants() {
  // Paginate just in case the table grows past 1k. Today it's ~966.
  const all: Array<{ id: number; name: string; symbol: string | null; category: string }> = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("contaminants")
      .select("id, name, symbol, category")
      .order("name")
      .range(offset, offset + 999);
    if (error) {
      console.error("contaminants list query:", error);
      break;
    }
    if (!data || data.length === 0) break;
    for (const r of data) all.push(r);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function fetchCounts() {
  const [contaminants, limits, recalls, bll] = await Promise.all([
    supabase.from("contaminants").select("*", { count: "exact", head: true }),
    supabase.from("contaminant_limits").select("*", { count: "exact", head: true }),
    supabase.from("recalls").select("*", { count: "exact", head: true }),
    supabase.from("bll_by_state").select("*", { count: "exact", head: true }),
  ]);
  return {
    contaminants: contaminants.count ?? 0,
    limits: limits.count ?? 0,
    recalls: recalls.count ?? 0,
    bll: bll.count ?? 0,
  };
}

export default async function Home() {
  const [featured, allContaminants, counts] = await Promise.all([
    fetchFeatured(),
    fetchAllContaminants(),
    fetchCounts(),
  ]);
  const sorted = [...featured].sort(
    (a, b) => FEATURED_NAMES.indexOf(a.name) - FEATURED_NAMES.indexOf(b.name),
  );

  return (
    <main className="max-w-4xl mx-auto px-6 pt-16 pb-12">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 mb-3">
        Island.
      </h1>
      <p className="text-xl text-stone-700 mb-3">The numbers, and what they mean.</p>
      <p className="text-base text-stone-600 max-w-2xl mb-8 leading-relaxed">
        How much of a contaminant you are exposed to, and what five different
        agencies say about it. No proprietary score. No paywall. Just public
        regulatory data with a citation behind every value.
      </p>

      <div className="mb-12">
        <ContaminantSearch items={allContaminants} />
      </div>

      <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-4">
        Featured contaminants
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
        {sorted.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.id}`}
            className="block rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-stone-900">{c.name}</span>
              {c.symbol && (
                <span className="text-xs text-stone-500 font-mono">{c.symbol}</span>
              )}
            </div>
            <div className="text-xs text-stone-500 mt-1 capitalize">
              {c.category.replace(/_/g, " ")}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white px-6 py-5">
        <h3 className="text-sm font-medium text-stone-900 mb-3">
          What is loaded right now
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Contaminants" n={counts.contaminants} />
          <Stat label="Agency limits" n={counts.limits} />
          <Stat label="Food recalls" n={counts.recalls} />
          <Stat label="BLL records" n={counts.bll} />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, n }: { label: string; n: number }) {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums text-stone-900">
        {n.toLocaleString()}
      </div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}
