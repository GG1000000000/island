import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getContaminant(id: number) {
  const { data: c } = await supabase
    .from("contaminants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!c) return null;

  const { data: limits } = await supabase
    .from("contaminant_limits")
    .select("*")
    .eq("contaminant_id", id)
    .order("agency");

  return { contaminant: c, limits: limits ?? [] };
}

export default async function ContaminantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) notFound();

  const data = await getContaminant(idNum);
  if (!data) notFound();
  const { contaminant: c, limits } = data;

  return (
    <main className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        all contaminants
      </Link>

      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
            {c.name}
          </h1>
          {c.symbol && <span className="text-lg text-stone-500 font-mono">{c.symbol}</span>}
        </div>
        <div className="flex gap-3 text-sm text-stone-600 flex-wrap">
          <span className="capitalize">{c.category.replace(/_/g, " ")}</span>
          {c.cas_number && (
            <>
              <span className="text-stone-300">·</span>
              <span className="font-mono">CAS {c.cas_number}</span>
            </>
          )}
          {c.is_carcinogen && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-amber-700">listed carcinogen</span>
            </>
          )}
          {c.is_reproductive_toxicant && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-amber-700">reproductive toxicant</span>
            </>
          )}
        </div>
      </div>

      {c.description && (
        <p className="text-base text-stone-700 mb-6 leading-relaxed">{c.description}</p>
      )}

      {c.health_effects && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-2">
            Health effects
          </h2>
          <p className="text-stone-700 leading-relaxed">{c.health_effects}</p>
        </div>
      )}

      {c.source_notes && (
        <div className="mb-10">
          <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-2">
            Where it shows up
          </h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">{c.source_notes}</p>
        </div>
      )}

      <h2 className="text-xs font-medium text-stone-900 uppercase tracking-wide mb-3">
        Limits and reference values
      </h2>
      {limits.length === 0 ? (
        <p className="text-stone-500 text-sm">
          No agency limits in the database for this contaminant yet.
        </p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700">Agency</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Type</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Context</th>
                  <th className="px-4 py-3 font-medium text-stone-700 text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {limits.map((L) => (
                  <tr key={L.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">{L.agency}</td>
                    <td className="px-4 py-3 text-stone-700 font-mono text-xs">{L.limit_type}</td>
                    <td className="px-4 py-3 text-stone-600">{L.context.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="font-medium text-stone-900">{L.amount}</span>
                      <span className="text-stone-500 ml-1">{L.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      {L.citation_url ? (
                        <a
                          href={L.citation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 text-xs"
                        >
                          cite <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-stone-300 text-xs">n/a</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-stone-500 leading-relaxed max-w-2xl">
        <strong className="text-stone-700">Glossary.</strong>{" "}
        MCL = Maximum Contaminant Level (legal limit). MCLG = Maximum Contaminant
        Level Goal (aspirational, often zero for carcinogens). NSRL = No
        Significant Risk Level (Prop 65 cancer). MADL = Maximum Allowable Dose
        Level (Prop 65 reproductive). MRL = Minimal Risk Level (ATSDR). TDI =
        Tolerable Daily Intake (EFSA). BLRV = Blood Lead Reference Value (CDC).
      </div>
    </main>
  );
}
