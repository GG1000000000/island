"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  symbol: string | null;
  category: string;
};

export function ContaminantSearch({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return items
      .filter(
        (it) =>
          it.name.toLowerCase().includes(s) ||
          (it.symbol ?? "").toLowerCase().includes(s),
      )
      .slice(0, 12);
  }, [q, items]);

  return (
    <div className="relative">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        // 200ms delay on blur so clicks on results register before the dropdown hides
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={`search ${items.length.toLocaleString()} contaminants by name or symbol...`}
        className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
      />
      {focused && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full border border-stone-200 rounded-lg bg-white overflow-hidden max-h-96 overflow-y-auto shadow-lg">
          {results.map((it) => (
            <Link
              key={it.id}
              href={`/c/${it.id}`}
              className="block px-4 py-2 hover:bg-stone-50 border-b last:border-b-0 border-stone-100 text-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-stone-900 font-medium">{it.name}</span>
                {it.symbol && (
                  <span className="text-xs text-stone-500 font-mono">{it.symbol}</span>
                )}
              </div>
              <div className="text-xs text-stone-500 capitalize mt-0.5">
                {it.category.replace(/_/g, " ")}
              </div>
            </Link>
          ))}
        </div>
      )}
      {focused && q.trim() && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full border border-stone-200 rounded-lg bg-white px-4 py-3 text-sm text-stone-500 shadow-lg">
          No contaminant matches &ldquo;{q}&rdquo;. The full list spans 966.
        </div>
      )}
    </div>
  );
}
