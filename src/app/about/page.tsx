import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Island is an open-source, freely accessible view of contaminant exposure. Every number cites its agency source. No proprietary score, no paywall, no email required.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 pt-16 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
        About Island
      </h1>
      <p className="text-xl text-stone-700 mb-8">The numbers, and what they mean.</p>

      <Section title="Why this exists">
        Most apps that show what is &ldquo;safe&rdquo; or &ldquo;risky&rdquo; in your food, water,
        and products hide the actual numbers behind a single proprietary score and a paywall.
        Island does the opposite. The number is the number. EPA, FDA, OEHHA (Prop 65), CDC,
        WHO, EFSA, and ATSDR each get a column. You decide how to read it.
      </Section>

      <Section title="What it covers">
        <ul className="list-disc pl-5 space-y-1 marker:text-stone-400">
          <li>966 regulated contaminants with descriptions, health effects, and exposure pathways</li>
          <li>410 agency reference values (limits, action levels, daily intakes) with citations</li>
          <li>25,026 openFDA food recalls, filterable by hazard</li>
          <li>38,000+ childhood blood lead surveillance records (CDC + NY + CT)</li>
          <li>33,774 US ZIP codes with housing-age + lead service line risk</li>
          <li>1,300 foods with per-serving heavy-metal data, in an exposure calculator</li>
          <li>704 branded products from 25 brands with aggregated lab averages</li>
        </ul>
      </Section>

      <Section title="Where the data comes from">
        Everything is US public-domain (government) or openly licensed:
        <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-stone-400">
          <li><strong>EPA</strong>: drinking water MCLs, PFAS NPDWR, Lead and Copper Rule Improvements, ACS housing-age data</li>
          <li><strong>FDA</strong>: &ldquo;Closer to Zero&rdquo; baby food heavy-metal action levels, juice / candy / fish action levels</li>
          <li><strong>openFDA</strong>: food enforcement / recalls</li>
          <li><strong>OEHHA (California)</strong>: Prop 65 chemicals list + safe-harbor levels (NSRL, MADL)</li>
          <li><strong>CDC</strong>: Childhood Blood Lead Surveillance, blood lead reference value</li>
          <li><strong>WHO + EFSA + ATSDR</strong>: international and scientific reference values</li>
          <li><strong>State DOHs</strong>: NY (ZIP-level), CT (town-level) childhood EBLL surveillance via Socrata</li>
          <li><strong>DetectLead</strong>: aggregated brand+product testing (XRF + ICP-MS)</li>
          <li><strong>bloodleadcalculator.com</strong>: per-food ppb data behind the exposure calculator</li>
        </ul>
      </Section>

      <Section title="What Island is not">
        <ul className="list-disc pl-5 space-y-1 marker:text-stone-400">
          <li>Not medical advice. Talk to a clinician for diagnosis or treatment decisions.</li>
          <li>Not a real-time water test. The tap-water page shows structural risk only.</li>
          <li>Not a substitute for product-specific lab testing. Brand averages are averages.</li>
          <li>Not a fear-marketing tool. The whole point is to show the range and let you read it yourself.</li>
        </ul>
      </Section>

      <Section title="Methodology">
        The scoring is the &ldquo;there is no score&rdquo; method. We show the raw number and
        what each agency says about it. Strict numbers and lenient numbers exist because each
        agency answers a different question (cancer vs reproductive, lifetime vs acute,
        legally enforceable vs aspirational). Every value links to its primary source.
      </Section>

      <Section title="Open source">
        Code, schema, ETL scripts, and the snapshot pipeline are all in the public repo:{" "}
        <a
          href="https://github.com/GG1000000000/island"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-stone-700 hover:text-stone-900"
        >
          github.com/GG1000000000/island
        </a>
        . MIT licensed. Run your own instance pointing at your own data. Fork it. Send PRs.
      </Section>

      <Section title="Built with">
        Next.js (App Router), Supabase (Postgres + RLS), Tailwind CSS, TypeScript. Hosted on Vercel.
        The deeper data layer (DetectLead Supabase) is shared with the parent DetectLead site.
      </Section>

      <div className="mt-12 text-sm text-stone-600">
        Questions, corrections, or a data source you think should be in here?{" "}
        <Link href="/" className="underline hover:text-stone-900">Back to home</Link>.
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-stone-900 uppercase tracking-wide mb-2">{title}</h2>
      <div className="text-stone-700 leading-relaxed">{children}</div>
    </section>
  );
}
