import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import brandsData from "@/data/brand_averages.json";
import productsData from "@/data/brand_product_averages.json";

type BrandRow = {
  brand: string;
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

type ProductRow = BrandRow & { product_name: string };

const METALS = [
  { key: "lead", symbol: "Pb" },
  { key: "arsenic", symbol: "As" },
  { key: "cadmium", symbol: "Cd" },
  { key: "mercury", symbol: "Hg" },
] as const;

export default async function BrandPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encoded } = await params;
  const name = decodeURIComponent(encoded);
  const brand = (brandsData as BrandRow[]).find((b) => b.brand === name);
  const products = (productsData as ProductRow[])
    .filter((p) => p.brand === name)
    .sort((a, b) => (b.lead_avg ?? 0) - (a.lead_avg ?? 0));
  if (!brand && products.length === 0) notFound();

  return (
    <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <Link
        href="/products"
        className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        all products
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-1">
        {name}
      </h1>
      <p className="text-stone-600 mb-8">
        {products.length} product{products.length === 1 ? "" : "s"} in the database.
        Heavy-metal averages across lots tested.
      </p>

      {brand && (
        <div>
          <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
            Brand-level summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {METALS.map((m) => {
              const avg = brand[`${m.key}_avg` as keyof BrandRow] as number | null;
              const max = brand[`${m.key}_max` as keyof BrandRow] as number | null;
              return (
                <div key={m.key} className="rounded-lg border border-stone-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-wide text-stone-500">
                    {m.symbol} avg
                  </div>
                  <div className={`text-2xl font-semibold tabular-nums mt-1 ${color(avg)}`}>
                    {fmtNum(avg)}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    max {fmtNum(max)} ppb
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
        All products from {name}
      </h2>
      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-700">Product</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">Lots</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">Pb avg</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">Pb max</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">As avg</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">Cd avg</th>
                <th className="px-4 py-3 font-medium text-stone-700 text-right">Hg avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p, i) => (
                <tr key={i} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3 text-stone-900">{p.product_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-700">
                    {p.lot_count ?? "—"}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${color(p.lead_avg)}`}>
                    {fmtNum(p.lead_avg)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-500">
                    {fmtNum(p.lead_max)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${color(p.arsenic_avg)}`}>
                    {fmtNum(p.arsenic_avg)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${color(p.cadmium_avg)}`}>
                    {fmtNum(p.cadmium_avg)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${color(p.mercury_avg)}`}>
                    {fmtNum(p.mercury_avg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function fmtNum(n: number | null) {
  if (n == null) return "—";
  if (n === 0) return "0";
  return n.toFixed(n < 1 ? 3 : n < 10 ? 2 : 1);
}

function color(n: number | null) {
  if (n == null) return "text-stone-300";
  if (n >= 100) return "text-red-700 font-medium";
  if (n >= 10) return "text-amber-700";
  return "text-stone-700";
}
