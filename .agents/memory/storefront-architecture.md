---
name: Storefront architecture
description: Initial boundary between real catalog data and client-side shopping interactions.
---

The first release uses Supabase direct reads for catalog data, with the Replit catalog API as a temporary compatibility fallback, and local client state for cart and wishlist interactions. Keep this boundary until authentication and persistent customer models are introduced.

**Why:** Direct Supabase reads let the Vite app run on Vercel or another static host without a fixed server port, while the fallback keeps the Replit preview usable before the catalog schema is initialized.

**How to apply:** Add persistent cart, wishlist, checkout, and account endpoints when those product surfaces are built; keep the catalog contract aligned with the Supabase schema and do not duplicate catalog data into frontend-only fixtures.