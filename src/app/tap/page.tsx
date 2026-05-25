import { ZipInput } from "./zip-input";

export const dynamic = "force-dynamic";

export default function TapPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 pt-16 pb-12">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        Tap water risk by ZIP
      </h1>
      <p className="text-stone-600 mb-2 max-w-2xl">
        Lead paint and lead service line exposure risk for your ZIP, based on
        housing age (US Census ACS) and EPA&apos;s state-level lead service line
        projections.
      </p>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        33,774 US ZIPs covered. This is structural risk (your housing stock),
        not a live water test. For an actual test, ask your utility for their
        annual Consumer Confidence Report or buy a certified lab kit.
      </p>

      <ZipInput />

      <div className="mt-12 rounded-lg bg-stone-100/60 border border-stone-200 p-5">
        <h3 className="text-xs uppercase tracking-wide text-stone-900 font-medium mb-2">
          What you get
        </h3>
        <ul className="text-sm text-stone-700 space-y-2 leading-relaxed">
          <li>
            <strong>Lead paint risk:</strong> percentage of housing units built
            before the 1978 residential lead paint ban, plus a breakdown by decade.
          </li>
          <li>
            <strong>Lead service line risk:</strong> EPA&apos;s 2025 DWINSA tier
            (1-5) for your state, based on estimated lead pipe inventory.
          </li>
          <li>
            <strong>Context:</strong> what the numbers mean and what to do next
            (utility CCR request, swab test, XRF scan).
          </li>
        </ul>
      </div>

      <p className="mt-8 text-xs text-stone-500 max-w-2xl">
        Sources: US Census ACS 2022 housing age by ZCTA (tables B25034 + B25035),
        EPA 2025 Update to the 7th DWINSA state lead service line projection.
      </p>
    </main>
  );
}
