import { supabase } from "@/lib/supabase";
import { Calculator, type FoodRow, type LimitRow } from "./calculator";

export const dynamic = "force-dynamic";

async function fetchFoods(): Promise<FoodRow[]> {
  // app.food_calc is only granted to service_role; the public app_api.food_calc
  // view exposes the same data to anon (capped at 500 rows by the view's LIMIT).
  // To unlock all 1,343 foods, run in Studio:
  //   GRANT SELECT ON app.food_calc TO anon;
  // and switch the Accept-Profile back to 'app'.
  const url =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/food_calc` +
    `?select=id,name,ppb,ppb_cadmium,ppb_arsenic,ppb_mercury,grams` +
    `&order=name`;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Accept-Profile": "app_api",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("food_calc fetch:", res.status, await res.text());
    return [];
  }
  return (await res.json()) as FoodRow[];
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
