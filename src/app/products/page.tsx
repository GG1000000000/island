import { ProductsTable, type ProductRow } from "./products-table";
import productsData from "@/data/brand_product_averages.json";
import brandsData from "@/data/brand_averages.json";

export const dynamic = "force-dynamic";

const PRODUCTS = productsData as ProductRow[];

export default function ProductsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        Products by brand
      </h1>
      <p className="text-stone-600 mb-2 max-w-2xl">
        Heavy-metal averages across lots tested for {PRODUCTS.length.toLocaleString()} products
        from {brandsData.length} brands. Lab values in ppb (µg/kg). Snapshot of
        DetectLead&apos;s aggregated test database.
      </p>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        These are averages, not max-only headlines. A high average across many lots
        is a different story than one bad outlier in one batch. Compare avg vs max
        in the table to see which it is for any given product. Sort by clicking the
        column you care about.
      </p>

      <ProductsTable rows={PRODUCTS} />

      <p className="mt-10 text-xs text-stone-500 max-w-2xl leading-relaxed">
        Source: DetectLead aggregated lab dataset (XRF + ICP-MS). Lot count per
        product varies. Some products have one test (a snapshot), some have dozens.
        For per-lot data and lab reports, see DetectLead.com. Compare any of these
        to agency reference values on the contaminant detail pages (e.g. lead at /c/1).
      </p>
    </main>
  );
}
