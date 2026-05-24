import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const HAZARD_OPTIONS = [
  "lead",
  "arsenic",
  "cadmium",
  "mercury",
  "salmonella",
  "listeria",
  "e. coli",
  "undeclared",
  "metal",
  "plastic",
];

async function fetchRecalls(hazard?: string) {
  let q = supabase
    .from("recalls")
    .select(
      "id,recall_date,classification,recalling_firm,product_description,reason_for_recall,hazard_terms,state",
    )
    .order("recall_date", { ascending: false, nullsFirst: false })
    .limit(100);
  if (hazard) q = q.contains("hazard_terms", [hazard]);
  const { data, error } = await q;
  if (error) console.error("recalls query:", error);
  return data ?? [];
}

export default async function RecallsPage({
  searchParams,
}: {
  searchParams: Promise<{ hazard?: string }>;
}) {
  const sp = await searchParams;
  const hazard = sp.hazard;
  const recalls = await fetchRecalls(hazard);

  return (
    <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        Food recalls
      </h1>
      <p className="text-stone-600 mb-6 max-w-2xl">
        Live feed from the FDA openFDA food enforcement API. {recalls.length} most
        recent records{hazard && ` mentioning "${hazard}"`}.
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        <FilterChip label="all" href="/recalls" active={!hazard} />
        {HAZARD_OPTIONS.map((h) => (
          <FilterChip
            key={h}
            label={h}
            href={`/recalls?hazard=${encodeURIComponent(h)}`}
            active={hazard === h}
          />
        ))}
      </div>

      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-700">Date</th>
                <th className="px-4 py-3 font-medium text-stone-700">Class</th>
                <th className="px-4 py-3 font-medium text-stone-700">Firm</th>
                <th className="px-4 py-3 font-medium text-stone-700">Reason</th>
                <th className="px-4 py-3 font-medium text-stone-700">Hazards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recalls.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/60 align-top">
                  <td className="px-4 py-3 text-stone-700 whitespace-nowrap tabular-nums">
                    {r.recall_date}
                  </td>
                  <td className="px-4 py-3">
                    <ClassBadge cls={r.classification} />
                  </td>
                  <td className="px-4 py-3 text-stone-900 max-w-xs">
                    {r.recalling_firm}
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-xl">
                    {r.reason_for_recall}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(r.hazard_terms ?? []).slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-8 text-xs text-stone-500 max-w-2xl">
        Data source:{" "}
        <a
          href="https://open.fda.gov/apis/food/enforcement/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          openFDA food/enforcement
        </a>
        . Class I = serious health risk. Class II = temporary or medically
        reversible. Class III = unlikely to cause adverse effects.
      </p>
    </main>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-stone-900 text-white border-stone-900"
          : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
      }`}
    >
      {label}
    </Link>
  );
}

function ClassBadge({ cls }: { cls: string | null }) {
  if (!cls) return null;
  const isI = cls === "Class I";
  const isII = cls === "Class II";
  const color = isI
    ? "bg-red-50 text-red-700 border-red-200"
    : isII
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-stone-50 text-stone-700 border-stone-200";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${color}`}
    >
      {cls}
    </span>
  );
}
