# Island

**The numbers, and what they mean.**

Island shows how much of a contaminant is in things, and what five different
agencies say about it. No proprietary score. No paywall. Just public
regulatory data with a citation behind every value.

## Why

Most "what's safe" apps gate raw measurements behind one proprietary score
and a subscription. Island does the opposite. The number is the number.
EPA, FDA, OEHHA (Prop 65), CDC, WHO, EFSA, and ATSDR each get a column.
You decide how to read it.

## Data sources

All public-domain (US government) or openly licensed:

| source | what |
|---|---|
| EPA | Primary drinking water MCLs, PFAS NPDWR, LCRI |
| FDA | "Closer to Zero" baby food heavy-metal action levels, juice / candy / fish action levels |
| OEHHA (CA) | Prop 65 chemicals list + safe-harbor NSRL / MADL values |
| CDC | Childhood Blood Lead Reference Value (BLRV) |
| WHO | Drinking water guidelines |
| EFSA | Scientific opinions on lead, cadmium, BPA, methylmercury |
| ATSDR | Minimal Risk Levels (planned) |
| openFDA | Food enforcement / recalls (full feed, ~25k records) |
| State DOHs | NY ZIP-level, CT town-level childhood elevated BLL surveillance |

## Stack

- Next.js 16 (App Router) on Vercel
- Supabase (Postgres + PostgREST + RLS), all tables in the `app` schema
- TypeScript, Tailwind CSS
- lucide-react icons

The schema is at [`oasis_sources_schema.sql`](https://github.com/) in the
parent data-pipeline repo. ETL scripts are alongside.

## Run locally

```bash
git clone https://github.com/<your-handle>/island.git
cd island
npm install --legacy-peer-deps
cp .env.local.example .env.local   # then fill in the two Supabase vars
npm run dev
```

Then open http://localhost:3000.

The Supabase project is read-only via the anon key; RLS lets the public
`app.*` tables read but nothing else. The defaults below point at the
shared DetectLead instance:

```
NEXT_PUBLIC_SUPABASE_URL=https://cioimzjvgtyvahxkvioj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2eXXDXoRzVJu9XRkbw3jEA_ruFnUnFQ
```

## Deploy on Vercel

One click from this repo on Vercel: pick "Import Project", point at this
GitHub repo, paste the two env vars above into Vercel's env panel, deploy.

## Contributing

Open. Issues and PRs welcome. The whole point is that nothing should be
hidden, including the methodology and the code that renders the data.

## License

MIT. Methodology is open; every data source is credited inline and links
back to the agency that published it.
