"use client";

import { useMemo, useState } from "react";

export type ProductRow = {
  brand: string;
  product_name: string;
  lot_count: number | null;
  lead_avg: number | null;
  lead_max: number | null;
  arsenic_avg: number | null;
  arsenic_max: number | null;
  cadmium_avg: number | null;
  cadmium_max: number | null;
  mercury_avg: number | null;
  mercury_max: number | null;
};

type SortKey =
  | "brand"
  | "product_name"
  | "lot_count"
  | "lead_avg"
  | "lead_max"
  | "arsenic_avg"
  | "cadmium_avg"
  | "mercury_avg";

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lead_avg");
  const [desc, setDesc] = useState(true);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = rows;
    if (s) {
      out = rows.filter(
        (r) =>
          r.brand.toLowerCase().includes(s) ||
          r.product_name.toLowerCase().includes(s),
      );
    }
    return [...out].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === "string" && typeof bv === "string") {
        return desc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      const an = (av as number | null) ?? -Infinity;
      const bn = (bv as number | null) ?? -Infinity;
      return desc ? bn - an : an - bn;
    });
  }, [rows, q, sortBy, desc]);

  function toggle(key: SortKey) {
    if (sortBy === key) setDesc(!desc);
    else {
      setSortBy(key);
      setDesc(true);
    }
  }

  function H({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) {
    const isActive = sortBy === k;
    return (
      <th
        scope="col"
        className={`px-4 py-3 font-medium text-stone-700 cursor-pointer select-none whitespace-nowrap text-${align}`}
        onClick={() => toggle(k)}
      >
        {label}
        {isActive && <span className="ml-1 text-xs text-stone-400">{desc ? "↓" : "↑"}</span>}
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${rows.length.toLocaleString()} products by brand or product name`}
        className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
      />

      <div className="text-xs text-stone-500">
        {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} shown.
        Sort by clicking column headers. Values are averages across lots in ppb (µg/kg).
      </div>

      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left">
              <tr>
                <H k="brand" label="Brand" />
                <H k="product_name" label="Product" />
                <H k="lot_count" label="Lots" align="right" />
                <H k="lead_avg" label="Pb avg" align="right" />
                <H k="lead_max" label="Pb max" align="right" />
                <H k="arsenic_avg" label="As avg" align="right" />
                <H k="cadmium_avg" label="Cd avg" align="right" />
                <H k="mercury_avg" label="Hg avg" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.slice(0, 200).map((r, i) => (
                <tr key={`${r.brand}-${r.product_name}-${i}`} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3 text-stone-900 font-medium whitespace-nowrap">{r.brand}</td>
                  <td className="px-4 py-3 text-stone-700">{r.product_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-700">{r.lot_count ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(r.lead_avg)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-500">{fmt(r.lead_max)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(r.arsenic_avg)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(r.cadmium_avg)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(r.mercury_avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <div className="px-4 py-3 text-xs text-stone-500 border-t border-stone-100">
            Showing first 200 of {filtered.length.toLocaleString()}. Refine the search to narrow further.
          </div>
        )}
      </div>
    </div>
  );
}

function fmt(n: number | null) {
  if (n == null) return <span className="text-stone-300">—</span>;
  if (n === 0) return <span className="text-stone-400">0</span>;
  const color = n >= 100 ? "text-red-700 font-medium" : n >= 10 ? "text-amber-700" : "text-stone-700";
  return <span className={color}>{n.toFixed(n < 1 ? 3 : n < 10 ? 2 : 1)}</span>;
}
