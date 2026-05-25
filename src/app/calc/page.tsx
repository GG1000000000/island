import { supabase } from "@/lib/supabase";
import { Calculator, type FoodRow, type CategoryRow, type LimitRow } from "./calculator";
import foodsData from "@/data/foods.json";
import categoriesData from "@/data/categories.json";

// Foods + categories are baked in from /src/data/*.json (snapshotted from
// bloodleadcalculator.com via supabase_migration/snapshot_blc_to_island.py).
// This protects BLC's shared hosting from Island traffic — Island never hits
// BLC at runtime; only when Eric re-runs the snapshot script.

type BlcFood = {
  id: number;
  name: string;
  ppb: string | null;
  ppb_cadmium: string | null;
  ppb_arsenic: string | null;
  ppb_mercury: string | null;
  grams: string | null;
  category_id: number | null;
};

type BlcCategory = { id: number; name: string; type: string };

function toNum(s: string | null): number | null {
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const FOODS: FoodRow[] = (foodsData as BlcFood[])
  .map<FoodRow>((r) => ({
    id: r.id,
    name: r.name,
    ppb: toNum(r.ppb),
    ppb_cadmium: toNum(r.ppb_cadmium),
    ppb_arsenic: toNum(r.ppb_arsenic),
    ppb_mercury: toNum(r.ppb_mercury),
    grams: toNum(r.grams),
    category_id: r.category_id ?? null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const CATEGORIES: CategoryRow[] = (categoriesData as BlcCategory[])
  .filter((c) => c.type === "food" || !c.type)
  .sort((a, b) => a.name.localeCompare(b.name));

async function fetchLimits(): Promise<LimitRow[]> {
  const wantedNames = ["Lead", "Cadmium", "Inorganic Arsenic", "Mercury"];
  const [contRes, limitRes] = await Promise.all([
    supabase.from("contaminants").select("id, name").in("name", wantedNames),
    supabase
      .from("contaminant_limits")
      .select("contaminant_id, agency, limit_type, amount, unit, notes, context")
      .eq("unit", "ug/day")
      .limit(200),
  ]);
  const idToName = new Map<number, string>();
  for (const c of contRes.data ?? []) {
    idToName.set(c.id, c.name);
  }
  const out: LimitRow[] = [];
  for (const L of limitRes.data ?? []) {
    const name = idToName.get(L.contaminant_id);
    if (!name) continue;
    out.push({
      contaminant: name,
      agency: L.agency,
      limit_type: L.limit_type,
      amount: L.amount,
      unit: L.unit,
      notes: L.notes,
    });
  }
  return out;
}

export default async function CalcPage() {
  const limits = await fetchLimits();
  const foods = FOODS;
  const categories = CATEGORIES;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        Exposure calculator
      </h1>
      <p className="text-stone-600 mb-2 max-w-2xl">
        Add what you eat in a day. See your estimated daily dose of lead, cadmium, arsenic,
        and mercury, and how it compares to every agency&apos;s reference level.
      </p>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        Per-food values come from public lab data ({foods.length.toLocaleString()} foods loaded).
        Reference levels: {limits.length} from EPA, FDA, OEHHA (Prop 65), CDC, EFSA, WHO.
      </p>

      <Calculator foods={foods} categories={categories} limits={limits} />

      <p className="mt-10 text-xs text-stone-500 max-w-2xl leading-relaxed">
        Estimates only. Per-food values represent typical detection levels from public studies;
        actual exposure varies by brand, batch, lot, and preparation. The math is dose (µg/day)
        = ppb in food × serving grams ÷ 1000 × servings/day. Compare to multiple frameworks and
        form your own view.
      </p>
    </main>
  );
}
