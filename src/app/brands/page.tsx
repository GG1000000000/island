import Link from "next/link";
import brandsData from "@/data/brand_averages.json";
import productsData from "@/data/brand_product_averages.json";

export const metadata = {
  title: "Brands",
  description:
    "All brands in the Island product database, with per-brand heavy-metal averages and lot counts.",
};

type Brand = {
  brand: string;
  lot_count: number | null;
  lead_avg: number | null;
  lead_max: number | null;
  arsenic_avg: number | null;
  cadmium_avg: number | null;
  mercury_avg: number | null;
};

export default function BrandsPage() {
  const brands = ([...(brandsData as Brand[])]).sort((a, b) =>
    (b.lead_avg ?? 0) - (a.lead_avg ?? 0),
  );

  // Count products per brand
  const productCount: Record<string, number> = {};
  for (const p of productsData as { brand: string }[]) {
    productCount[p.brand] = (productCount[p.brand] ?? 0) + 1;
  }

  return (
    <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        All brands
      </h1>
      <p className="text-stone-600 mb-2 max-w-2xl">
        {brands.length} brands in the Island product database, sorted by average
        lead content (highest first). Click a brand to see all of its tested
        products.
      </p>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        Averages are across all lots tested. Values in ppb (µg/kg). A high
        brand-wide average reflects either many problem lots or one famous
        outlier; click into the brand to see the per-product breakdown.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brands.map((b) => {
          const count = productCount[b.brand] ?? 0;
          return (
            <Link
              key={b.brand}
              href={`/brand/${encodeURIComponent(b.brand)}`}
              className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-medium text-stone-900">{b.brand}</span>
                <span className="text-xs text-stone-500">{count} product{count === 1 ? "" : "s"}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <Stat label="Pb" v={b.lead_avg} />
                <Stat label="As" v={b.arsenic_avg} />
                <Stat label="Cd" v={b.cadmium_avg} />
                <Stat label="Hg" v={b.mercury_avg} />
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-stone-500 max-w-2xl">
        Data: DetectLead aggregated lab dataset (XRF + ICP-MS), snapshot of
        app.brand_averages and app.brand_product_averages.
      </p>
    </main>
  );
}

function Stat({ label, v }: { label: string; v: number | null }) {
  const color =
    v == null
      ? "text-stone-300"
      : v >= 100
        ? "text-red-700"
        : v >= 10
          ? "text-amber-700"
          : "text-stone-700";
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-stone-500">{label}</span>
      <span className={`tabular-nums font-medium ${color}`}>
        {v == null ? "—" : v.toFixed(v < 1 ? 2 : v < 10 ? 1 : 0)}
      </span>
    </div>
  );
}
