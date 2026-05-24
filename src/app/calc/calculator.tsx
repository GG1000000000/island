"use client";

import { useMemo, useState } from "react";

export type FoodRow = {
  id: number;
  name: string;
  ppb: number | null;            // lead
  ppb_cadmium: number | null;
  ppb_arsenic: number | null;
  ppb_mercury: number | null;
  grams: number | null;          // serving size
};

export type LimitRow = {
  contaminant: string;
  agency: string;
  limit_type: string;
  amount: number;
  unit: string;
  notes: string | null;
};

const METALS: Array<{ key: keyof FoodTotals; label: string; contaminantName: string; field: keyof FoodRow }> = [
  { key: "lead",     label: "Lead",                contaminantName: "Lead",              field: "ppb" },
  { key: "cadmium",  label: "Cadmium",             contaminantName: "Cadmium",           field: "ppb_cadmium" },
  { key: "arsenic",  label: "Inorganic Arsenic",   contaminantName: "Inorganic Arsenic", field: "ppb_arsenic" },
  { key: "mercury",  label: "Mercury",             contaminantName: "Mercury",           field: "ppb_mercury" },
];

type FoodTotals = { lead: number; cadmium: number; arsenic: number; mercury: number };

export function Calculator({ foods, limits }: { foods: FoodRow[]; limits: LimitRow[] }) {
  const [search, setSearch] = useState("");
  const [picks, setPicks] = useState<Record<number, number>>({}); // foodId -> servings

  const matched = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return foods
      .filter((f) => f.name.toLowerCase().includes(s))
      .slice(0, 20);
  }, [foods, search]);

  const totals: FoodTotals = useMemo(() => {
    const t: FoodTotals = { lead: 0, cadmium: 0, arsenic: 0, mercury: 0 };
    for (const [idStr, srv] of Object.entries(picks)) {
      const id = Number(idStr);
      const f = foods.find((x) => x.id === id);
      if (!f || !f.grams) continue;
      // dose (µg) = ppb (µg/kg) × grams / 1000 × servings
      const dose = (ppb: number | null) => ((ppb ?? 0) * f.grams! / 1000) * srv;
      t.lead    += dose(f.ppb);
      t.cadmium += dose(f.ppb_cadmium);
      t.arsenic += dose(f.ppb_arsenic);
      t.mercury += dose(f.ppb_mercury);
    }
    return t;
  }, [picks, foods]);

  const limitsByContaminant = useMemo(() => {
    const out: Record<string, LimitRow[]> = {};
    for (const L of limits) {
      (out[L.contaminant] ??= []).push(L);
    }
    // sort by amount asc (strictest first) per contaminant
    for (const k of Object.keys(out)) {
      out[k].sort((a, b) => a.amount - b.amount);
    }
    return out;
  }, [limits]);

  const pickEntries = Object.entries(picks).filter(([, srv]) => srv > 0);
  const hasPicks = pickEntries.length > 0;

  return (
    <div className="space-y-8">
      {/* SEARCH */}
      <section>
        <label className="text-xs font-medium text-stone-900 uppercase tracking-wide block mb-2">
          Add a food
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search 1,343 foods: rice, apple juice, tuna, baby cereal..."
          className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
        />
        {matched.length > 0 && (
          <div className="mt-2 border border-stone-200 rounded-lg bg-white overflow-hidden max-h-80 overflow-y-auto">
            {matched.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setPicks((p) => ({ ...p, [f.id]: (p[f.id] ?? 0) + 1 }));
                  setSearch("");
                }}
                className="w-full text-left px-4 py-2 hover:bg-stone-50 border-b last:border-b-0 border-stone-100 text-sm flex items-center justify-between gap-3"
              >
                <span className="text-stone-900">{f.name}</span>
                <span className="text-xs text-stone-500 whitespace-nowrap">
                  {f.grams ? `${f.grams}g/serving` : "no serving size"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* PICKS */}
      {hasPicks && (
        <section>
          <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
            Today&apos;s intake ({pickEntries.length} food{pickEntries.length === 1 ? "" : "s"})
          </h2>
          <div className="border border-stone-200 rounded-lg bg-white divide-y divide-stone-100">
            {pickEntries.map(([idStr, srv]) => {
              const id = Number(idStr);
              const f = foods.find((x) => x.id === id);
              if (!f) return null;
              return (
                <div key={id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                  <span className="flex-1 text-sm text-stone-900 min-w-0">
                    {f.name}
                  </span>
                  <span className="text-xs text-stone-500 whitespace-nowrap">
                    {f.grams}g
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={srv}
                    onChange={(e) =>
                      setPicks((p) => ({ ...p, [id]: Number(e.target.value) || 0 }))
                    }
                    className="w-20 px-2 py-1 text-right tabular-nums border border-stone-200 rounded text-sm focus:outline-none focus:border-stone-500"
                  />
                  <span className="text-xs text-stone-500">servings</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPicks((p) => {
                        const c = { ...p };
                        delete c[id];
                        return c;
                      })
                    }
                    className="text-xs text-stone-400 hover:text-red-600"
                  >
                    remove
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TOTALS + COMPARISONS */}
      <section>
        <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
          Estimated daily intake vs agency reference levels
        </h2>
        <div className="grid gap-4">
          {METALS.map((m) => {
            const dose = totals[m.key];
            const lims = limitsByContaminant[m.contaminantName] ?? [];
            return (
              <div key={m.key} className="border border-stone-200 rounded-lg bg-white px-5 py-4">
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-medium text-stone-900">{m.label}</h3>
                  <div className="text-2xl font-semibold tabular-nums text-stone-900">
                    {dose.toFixed(3)}{" "}
                    <span className="text-sm font-normal text-stone-500">µg/day from picked foods</span>
                  </div>
                </div>
                {lims.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    No µg/day reference levels in the database for {m.contaminantName} yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    {lims.map((L, i) => {
                      const ratio = L.amount > 0 ? dose / L.amount : 0;
                      const color =
                        ratio >= 1
                          ? "text-red-700"
                          : ratio >= 0.5
                            ? "text-amber-700"
                            : ratio > 0
                              ? "text-stone-600"
                              : "text-stone-300";
                      const pct = ratio === 0 ? "—" : `${(ratio * 100).toFixed(0)}%`;
                      return (
                        <div key={i} className="flex justify-between gap-3 flex-wrap">
                          <span className="text-stone-600">
                            {L.agency} {L.limit_type}: {L.amount} {L.unit}
                          </span>
                          <span className={`tabular-nums font-medium ${color}`}>
                            {pct} of limit
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
