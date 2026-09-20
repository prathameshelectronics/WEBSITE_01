-- Prathemesh Electronics catalog schema
-- Run this file once in the Supabase SQL editor.

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  brand text not null,
  name text not null,
  category text not null,
  category_label text not null,
  description text not null,
  specs jsonb not null default '[]'::jsonb,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  price integer not null check (price >= 0),
  mrp integer not null check (mrp >= price),
  discount integer not null default 0 check (discount >= 0 and discount <= 100),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  badge text,
  badge_tone text,
  emi text not null,
  delivery text not null,
  stock integer not null default 0 check (stock >= 0),
  color text not null,
  warranty text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  count integer not null default 0,
  image text not null,
  accent text not null
);

create table if not exists public.deals (
  id text primary key,
  eyebrow text not null,
  title text not null,
  description text not null,
  cta text not null,
  accent text not null,
  product_slugs jsonb not null default '[]'::jsonb
);

create table if not exists public.brands (
  id text primary key,
  name text unique not null
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_slug_idx on public.products (slug);

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.deals enable row level security;
alter table public.brands enable row level security;

drop policy if exists "Public catalog read" on public.products;
create policy "Public catalog read" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "Public category read" on public.categories;
create policy "Public category read" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "Public deal read" on public.deals;
create policy "Public deal read" on public.deals
  for select to anon, authenticated using (true);

drop policy if exists "Public brand read" on public.brands;
create policy "Public brand read" on public.brands
  for select to anon, authenticated using (true);

insert into public.products (
  id, slug, brand, name, category, category_label, description, specs, image, gallery,
  price, mrp, discount, rating, review_count, badge, badge_tone, emi, delivery,
  stock, color, warranty, featured
) values
(
  'prod-zenphone-12', 'zenphone-12-pro', 'Zenith', 'ZenPhone 12 Pro', 'smartphones',
  'Smartphones', 'A flagship phone built for fast-moving days, with a bright LTPO display and a camera system tuned for low light.',
  jsonb_build_array('6.7" LTPO AMOLED', '12 GB RAM', '256 GB storage', '50 MP camera'),
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85'
  ),
  69999, 79999, 13, 4.8, 412, 'New arrival', 'cyan',
  'No-cost EMI from ₹5,833/mo', 'Free delivery by 24 Sep', 19, 'Midnight',
  '1 year manufacturer warranty', true
),
(
  'prod-macbook-air-m4', 'macbook-air-m4', 'Apple', 'MacBook Air 13" M4', 'laptops',
  'Laptops', 'The everyday laptop with a silent M4 chip, all-day battery, and a display that makes focused work feel effortless.',
  jsonb_build_array('Apple M4 chip', '16 GB unified memory', '512 GB SSD', '13.6" Liquid Retina'),
  'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85'
  ),
  104990, 114990, 9, 4.9, 867, 'Best seller', 'orange',
  'No-cost EMI from ₹8,749/mo', 'Free delivery by 25 Sep', 12, 'Starlight',
  '1 year Apple limited warranty', true
),
(
  'prod-pulse-buds', 'pulse-buds-pro', 'Auralis', 'Pulse Buds Pro', 'audio',
  'Audio', 'Deep, detailed sound with adaptive noise cancellation and a case that keeps up with your commute.',
  jsonb_build_array('Adaptive ANC', '42 hr battery', 'IPX5 water resistant', 'Dual-device pairing'),
  'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85'
  ),
  4999, 7999, 38, 4.6, 1248, 'Limited deal', 'purple',
  'EMI available on orders above ₹3,000', 'Delivery by 23 Sep', 47, 'Graphite',
  '1 year warranty', true
),
(
  'prod-nova-tv', 'nova-55-4k-qled-tv', 'Nova', '55" 4K QLED Smart TV', 'televisions',
  'Televisions', 'Cinema-scale colour and contrast with a clean interface for streaming, sports, and console nights.',
  jsonb_build_array('55" QLED 4K', '144 Hz gaming mode', 'Dolby Vision + Atmos', 'Hands-free voice'),
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=85'
  ),
  52990, 74990, 29, 4.7, 226, 'Hot deal', 'red',
  'No-cost EMI from ₹4,416/mo', 'Free delivery by 27 Sep', 8, 'Black',
  '2 years comprehensive warranty', true
),
(
  'prod-orbit-console', 'orbit-console-x', 'Orbit', 'Orbit Console X', 'gaming',
  'Gaming', 'A next-generation console with quick resume, immersive haptics, and enough power for the big-screen setup.',
  jsonb_build_array('1 TB SSD', '4K 120 fps', 'Ray tracing', 'Wireless controller included'),
  'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=900&q=85'
  ),
  44990, 49990, 10, 4.8, 143, 'Trending', 'green',
  'No-cost EMI from ₹3,749/mo', 'Delivery by 26 Sep', 14, 'Arctic white',
  '1 year warranty', true
),
(
  'prod-vertex-watch', 'vertex-watch-active', 'Vertex', 'Vertex Watch Active', 'wearables',
  'Wearables', 'A lightweight health companion with a vivid AMOLED face, built-in GPS, and up to 10 days of battery life.',
  jsonb_build_array('1.5" AMOLED', 'GPS + 5 ATM', '10-day battery', '100+ sport modes'),
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'
  ),
  7999, 11999, 33, 4.4, 584, 'Recommended', 'blue',
  'EMI available on orders above ₹3,000', 'Delivery by 23 Sep', 32, 'Sage',
  '1 year warranty', false
),
(
  'prod-lumina-camera', 'lumina-vlog-camera', 'Lumina', 'Lumina Vlog Camera', 'cameras',
  'Cameras', 'A pocketable camera for creators who want crisp 4K video, flattering autofocus, and easy wireless transfers.',
  jsonb_build_array('24 MP sensor', '4K 30 fps video', 'Flip touchscreen', 'Wi-Fi + Bluetooth'),
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=900&q=85'
  ),
  38990, 44990, 13, 4.5, 94, 'Creator pick', 'pink',
  'No-cost EMI from ₹3,249/mo', 'Delivery by 28 Sep', 6, 'Black',
  '2 years warranty', false
),
(
  'prod-grid-speaker', 'grid-portable-speaker', 'Grid', 'Grid Portable Speaker', 'audio',
  'Audio', 'Room-filling sound in a compact body, with a rugged finish for weekends away from the wall socket.',
  jsonb_build_array('24 hr playback', '360° sound', 'IP67 rated', 'Party pairing'),
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=85'
  ),
  6990, 9990, 30, 4.6, 364, 'Hot deal', 'red',
  'EMI available on orders above ₹3,000', 'Delivery by 24 Sep', 25, 'Sunset orange',
  '1 year warranty', false
)
on conflict (id) do nothing;

insert into public.categories (id, slug, name, count, image, accent) values
  ('cat-smartphones', 'smartphones', 'Smartphones', 248, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85', 'violet'),
  ('cat-laptops', 'laptops', 'Laptops', 186, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85', 'blue'),
  ('cat-gaming', 'gaming', 'Gaming', 132, 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=85', 'red'),
  ('cat-audio', 'audio', 'Audio', 304, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', 'orange'),
  ('cat-televisions', 'televisions', 'Televisions', 97, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85', 'cyan'),
  ('cat-wearables', 'wearables', 'Wearables', 118, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85', 'green')
on conflict (id) do nothing;

insert into public.deals (id, eyebrow, title, description, cta, accent, product_slugs) values
  ('deal-festive-upgrade', 'The tech upgrade event', 'Make room for better.', 'Save up to ₹22,000 on phones, laptops, and home entertainment this week.', 'Explore offers', 'violet', '["zenphone-12-pro", "macbook-air-m4", "nova-55-4k-qled-tv"]'::jsonb),
  ('deal-audio-escape', 'Sound, your way', 'Tune out the noise.', 'Up to 40% off earbuds and speakers, with free delivery across India.', 'Shop audio', 'orange', '["pulse-buds-pro", "grid-portable-speaker"]'::jsonb)
on conflict (id) do nothing;

insert into public.brands (id, name) values
  ('brand-apple', 'Apple'),
  ('brand-samsung', 'Samsung'),
  ('brand-sony', 'Sony'),
  ('brand-nothing', 'Nothing'),
  ('brand-jbl', 'JBL'),
  ('brand-asus', 'ASUS'),
  ('brand-oneplus', 'OnePlus')
on conflict (id) do nothing;