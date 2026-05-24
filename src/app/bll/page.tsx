import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function fetchStateData() {
  const { data } = await supabase
    .from("bll_by_state")
    .select(
      "state,geo_name,year,threshold_ugdl,children_tested,children_ebll,ebll_pct",
    )
    .like("source", "CDC_CBLS%")
    .eq("year", 2022)
    .eq("threshold_ugdl", 5)
    .order("ebll_pct", { ascending: false, nullsFirst: false })
    .limit(60);
  return data ?? [];
}

async function fetchNyZips() {
  const { data } = await supabase
    .from("bll_by_state")
    .select("geo_id,geo_name,children_tested,children_ebll,ebll_pct")
    .eq("state", "NY")
    .eq("year", 2024)
    .eq("threshold_ugdl", 10)
    .gt("children_tested", 100)
    .order("ebll_pct", { ascending: false, nullsFirst: false })
    .limit(15);
  return data ?? [];
}

async function fetchCounts() {
  const [ny, ct, cdc] = await Promise.all([
    supabase
      .from("bll_by_state")
      .select("*", { count: "exact", head: true })
      .eq("state", "NY"),
    supabase
      .from("bll_by_state")
      .select("*", { count: "exact", head: true })
      .eq("state", "CT"),
    supabase
      .from("bll_by_state")
      .select("*", { count: "exact", head: true })
      .like("source", "CDC_CBLS%"),
  ]);
  return { ny: ny.count ?? 0, ct: ct.count ?? 0, cdc: cdc.count ?? 0 };
}

export default async function BllPage() {
  const [states, nyZips, counts] = await Promise.all([
    fetchStateData(),
    fetchNyZips(),
    fetchCounts(),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        Childhood blood lead by state
      </h1>
      <p className="text-stone-600 mb-2 max-w-2xl">
        Confirmed elevated blood lead levels in children under 6, by state, 2022.
        Showing the ≥5 µg/dL threshold (CDC also reports ≥3.5 and ≥10).
      </p>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        The CDC&apos;s reference value for elevated is currently 3.5 µg/dL (updated 2021).
        There is no safe blood lead level in children.
      </p>

      <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
        States by % elevated ≥5 µg/dL (2022)
      </h2>
      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white mb-12">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">State</th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">
                Tested
              </th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">
                Elevated ≥5
              </th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {states.map((s) => (
              <tr key={s.state} className="hover:bg-stone-50/60">
                <td className="px-4 py-3 font-medium text-stone-900">
                  {s.geo_name}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                  {s.children_tested?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                  {s.children_ebll?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-stone-900">
                  {s.ebll_pct != null ? `${s.ebll_pct.toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
        New York: top 15 ZIPs by % elevated ≥10 µg/dL (2024, ≥100 children tested)
      </h2>
      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white mb-8">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">ZIP</th>
              <th className="px-4 py-3 font-medium text-stone-700">County</th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">
                Tested
              </th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">
                Elevated
              </th>
              <th className="px-4 py-3 font-medium text-stone-700 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {nyZips.map((z) => (
              <tr key={z.geo_id} className="hover:bg-stone-50/60">
                <td className="px-4 py-3 font-mono text-stone-900">{z.geo_id}</td>
                <td className="px-4 py-3 text-stone-600">{z.geo_name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                  {z.children_tested?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                  {z.children_ebll?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-stone-900">
                  {z.ebll_pct != null ? `${z.ebll_pct.toFixed(2)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-500 max-w-2xl">
        Sources: CDC Childhood Blood Lead Surveillance ({counts.cdc} state-year-threshold
        rows), NY State DOH Lead Surveillance via Socrata d54z-enu8 ({counts.ny.toLocaleString()}{" "}
        ZIP-year rows), CT DPH via Socrata 42s2-3jt4 ({counts.ct.toLocaleString()} town-year-threshold
        rows). Thresholds vary by state because reporting standards do; each row carries its
        own threshold in the underlying table.
      </p>
    </main>
  );
}
