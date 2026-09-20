# Prathemesh Electronics

Prathemesh Electronics is a premium India-ready electronics marketplace storefront for discovering, comparing, and buying modern technology products.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `/admin` — open the catalog operations workspace from the storefront
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/prathemesh-electronics/src/App.tsx` — storefront routes, catalog screens, cart, wishlist, and shared shell.
- `artifacts/prathemesh-electronics/src/index.css` — storefront theme tokens, typography, responsive layout, and motion.
- `artifacts/prathemesh-electronics/src/lib/supabase-catalog.ts` — portable Supabase catalog client and Replit compatibility fallback.
- `lib/api-spec/openapi.yaml` — source of truth for catalog API contracts.
- `artifacts/api-server/src/routes/catalog.ts` — catalog API handlers.
- `artifacts/api-server/src/routes/catalog-data.ts` — initial demo catalog data and image references.
- `supabase/schema.sql` — Supabase catalog schema, read policies, indexes, and seed data.
- `vercel.json` — Vercel static build and SPA routing configuration.

## Architecture decisions

- The initial build prioritizes a complete, functional storefront before expanding into seller and admin surfaces.
- Catalog reads use Supabase directly so the static Vite app can run on Vercel and other hosts; Replit's API remains a compatibility fallback until the Supabase catalog tables are created.
- When Supabase credentials are not configured, the storefront and admin workspace read the seeded catalog through the Replit API fallback; admin edits are preview-only and remain in browser state.
- Cart and wishlist are client-side first-build state so the shopping experience works without authentication.
- Product imagery uses curated remote image assets while the catalog model remains ready for persistent storage and object storage later.

## Product

The first release includes a responsive home experience, searchable and filterable product catalog, product detail pages, deals, cart updates, wishlist feedback, delivery PIN checks, and realistic India-focused demo content.

## User preferences

No additional preferences recorded.

## Gotchas

- The frontend and API are managed artifact workflows; use the configured workflows rather than starting root-level dev commands.
- Re-run API codegen after changing `lib/api-spec/openapi.yaml`.
- Run `supabase/schema.sql` once in the Supabase SQL editor before relying on direct catalog reads.
- Vercel needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured as project environment variables.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
