import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import type { Category, Deal, Product } from '@workspace/api-client-react';

export type { Category, Deal, Product };

export type HomeData = {
  heroProducts: Product[];
  featuredProducts: Product[];
  categories: Category[];
  deals: Deal[];
  brands: string[];
};

type ProductRow = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  category_label: string;
  description: string;
  specs: string[];
  image: string;
  gallery: string[];
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  review_count: number;
  badge: string | null;
  badge_tone: string | null;
  emi: string;
  delivery: string;
  stock: number;
  color: string;
  warranty: string;
  featured: boolean;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  count: number;
  image: string;
  accent: string;
};

type DealRow = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  accent: string;
  product_slugs: string[];
};

let supabase: SupabaseClient | null = null;

function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!supabase) supabase = createClient(url, anonKey);
  return supabase;
}

function throwIfError(error: { message: string } | null) {
  if (error) {
    throw new Error(
      error.message.includes('Could not find the table')
        ? 'Supabase catalog tables are missing. Run supabase/schema.sql in the Supabase SQL editor first.'
        : error.message,
    );
  }
}

async function fetchReplitCatalog<T>(path: string) {
  const response = await fetch(`/api${path}`);
  if (!response.ok) {
    throw new Error(
      'Supabase catalog tables are missing. Run supabase/schema.sql in the Supabase SQL editor first.',
    );
  }
  return (await response.json()) as T;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label,
    description: row.description,
    specs: row.specs,
    image: row.image,
    gallery: row.gallery,
    price: row.price,
    mrp: row.mrp,
    discount: row.discount,
    rating: row.rating,
    reviewCount: row.review_count,
    badge: row.badge,
    badgeTone: row.badge_tone,
    emi: row.emi,
    delivery: row.delivery,
    stock: row.stock,
    color: row.color,
    warranty: row.warranty,
    featured: row.featured,
  };
}

async function listProducts(params?: {
  q?: string;
  category?: string;
  limit?: number;
}) {
  const client = getSupabase();
  if (!client) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    query.set('limit', String(params?.limit ?? 12));
    return fetchReplitCatalog<Product[]>(`/products?${query.toString()}`);
  }
  let request = client
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false })
    .limit(params?.limit ?? 12);
  if (params?.category) request = request.eq('category', params.category);
  const { data, error } = await request;
  if (error?.message.includes('Could not find the table')) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    query.set('limit', String(params?.limit ?? 12));
    return fetchReplitCatalog<Product[]>(`/products?${query.toString()}`);
  }
  throwIfError(error);

  const query = params?.q?.trim().toLowerCase();
  return ((data ?? []) as ProductRow[])
    .map(mapProduct)
    .filter((product) => {
      if (!query) return true;
      return [product.name, product.brand, product.categoryLabel, ...product.specs]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
}

async function getProductBySlug(slug: string) {
  const client = getSupabase();
  if (!client) return fetchReplitCatalog<Product>(`/products/${encodeURIComponent(slug)}`);
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error?.message.includes('Could not find the table')) {
    return fetchReplitCatalog<Product>(`/products/${encodeURIComponent(slug)}`);
  }
  throwIfError(error);
  if (!data) throw new Error('Product not found');
  return mapProduct(data as ProductRow);
}

async function listCategories() {
  const client = getSupabase();
  if (!client) return fetchReplitCatalog<Category[]>('/categories');
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name');
  if (error?.message.includes('Could not find the table')) {
    return fetchReplitCatalog<Category[]>('/categories');
  }
  throwIfError(error);
  return (data ?? []) as CategoryRow[];
}

async function listDeals() {
  const client = getSupabase();
  if (!client) return fetchReplitCatalog<Deal[]>('/deals');
  const { data, error } = await client
    .from('deals')
    .select('*')
    .order('id');
  if (error?.message.includes('Could not find the table')) {
    return fetchReplitCatalog<Deal[]>('/deals');
  }
  throwIfError(error);
  return ((data ?? []) as DealRow[]).map((deal) => ({
    id: deal.id,
    eyebrow: deal.eyebrow,
    title: deal.title,
    description: deal.description,
    cta: deal.cta,
    accent: deal.accent,
    productSlugs: deal.product_slugs,
  }));
}

async function listBrands() {
  const client = getSupabase();
  if (!client) {
    const home = await fetchReplitCatalog<HomeData>('/storefront/home');
    return home.brands;
  }
  const { data, error } = await client
    .from('brands')
    .select('name')
    .order('name');
  if (error?.message.includes('Could not find the table')) {
    const home = await fetchReplitCatalog<HomeData>('/storefront/home');
    return home.brands;
  }
  throwIfError(error);
  return (data ?? []).map((brand) => brand.name as string);
}

async function getHome() {
  const [products, categories, deals, brands] = await Promise.all([
    listProducts({ limit: 50 }),
    listCategories(),
    listDeals(),
    listBrands(),
  ]);
  return {
    heroProducts: products.filter((product) => product.featured).slice(0, 3),
    featuredProducts: products.filter((product) => product.featured),
    categories,
    deals,
    brands,
  } satisfies HomeData;
}

export function useGetStorefrontHome() {
  return useQuery({ queryKey: ['storefront-home'], queryFn: getHome });
}

export function useListProducts(params?: {
  q?: string;
  category?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['products', params?.q ?? '', params?.category ?? '', params?.limit ?? 12],
    queryFn: () => listProducts(params),
  });
}

export function useGetProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useListCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories });
}

export function useListDeals() {
  return useQuery({ queryKey: ['deals'], queryFn: listDeals });
}