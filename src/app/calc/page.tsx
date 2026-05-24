import { supabase } from "@/lib/supabase";
import { Calculator, type FoodRow, type LimitRow } from "./calculator";

export const dynamic = "force-dynamic";

async function fetchFoods(): Promise<FoodRow[]> {
  // Requires: GRANT SELECT ON app.food_calc TO anon; in Supabase Studio.
  // (The legacy app_api.* views are NOT PostgREST-exposed; only the `app`
  // schema is, and the base tables need their own grants for anon.)
  const all: FoodRow[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("food_calc")
      .select("id, name, ppb, ppb_cadmium, ppb_arsenic, ppb_mercury, grams")
      .order("name")
      .range(offset, offset + 999);
    if (error) {
      console.error("food_calc query failed (run the GRANT):", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    for (const r of data) {
      all.push({
        id: r.id,
        name: r.name,
        ppb: r.ppb,
        ppb_cadmium: r.ppb_cadmium,
        ppb_arsenic: r.ppb_arsenic,
        ppb_mercury: r.ppb_mercury,
        grams: r.grams,
      });
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

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
  const [foods, limits] = await Promise.all([fetchFoods(), fetchLimits()]);

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

      <Calculator foods={foods} limits={limits} />

      <p className="mt-10 text-xs text-stone-500 max-w-2xl leading-relaxed">
        Estimates only. Per-food values represent typical detection levels from public studies;
        actual exposure varies by brand, batch, lot, and preparation. The math is dose (µg/day)
        = ppb in food × serving grams ÷ 1000 × servings/day. Compare to multiple frameworks and
        form your own view.
      </p>
    </main>
  );
}
