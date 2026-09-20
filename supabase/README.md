# Supabase setup

1. Open the Supabase SQL editor for the connected project.
2. Run `supabase/schema.sql` once. It creates the public catalog tables, read policies, indexes, and initial demo catalog.
3. Set these environment variables in Replit and Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

The storefront reads catalog data directly from Supabase, so the Vercel build is a static Vite app and does not depend on the Replit API server or a fixed port.