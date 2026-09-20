import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetProductBySlug, useGetStorefrontHome, useListCategories, useListDeals, useListProducts } from '@/lib/supabase-catalog';
import type { Category, Deal, Product } from '@/lib/supabase-catalog';
import { Heart, Search, ShoppingBag, ArrowRight, ChevronRight, Minus, Plus, Trash2, ShieldCheck, Truck, RotateCcw, Headphones, Star, X, CircleAlert, PackageOpen, SlidersHorizontal, Sparkles, MapPin, LockKeyhole } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import AdminPage from '@/pages/admin';

const queryClient = new QueryClient();
const formatINR = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const imageFor = (product?: Product) => product?.image || product?.gallery?.[0] || '';

type CartItem = { product: Product; quantity: number };
type ShopContextValue = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  hasSaved: (id: string) => boolean;
  cartCount: number;
  toast: string;
};
const ShopContext = createContext<ShopContextValue | null>(null);
const useShop = () => {
  const value = useContext(ShopContext);
  if (!value) throw new Error('Shop context is unavailable');
  return value;
};

function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };
  const addToCart = (product: Product, quantity = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) return items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...items, { product, quantity }];
    });
    notify(`${product.brand} ${product.name} added to cart`);
  };
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity } : item));
  };
  const removeFromCart = (id: string) => setCart((items) => items.filter((item) => item.product.id !== id));
  const toggleWishlist = (id: string) => {
    setWishlist((saved) => {
      const isSaved = saved.includes(id);
      notify(isSaved ? 'Removed from saved items' : 'Saved for later');
      return isSaved ? saved.filter((item) => item !== id) : [...saved, id];
    });
  };
  const value = {
    cart, wishlist, addToCart, updateQuantity, removeFromCart, toggleWishlist,
    hasSaved: (id: string) => wishlist.includes(id),
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    toast,
  };
  return <ShopContext.Provider value={value}>{children}{toast && <div className="toast-note" role="status" data-testid="status-toast"><strong>Done.</strong> {toast}</div>}</ShopContext.Provider>;
}

function Brand() {
  return <Link href="/" className="brand" data-testid="link-brand">
    <span className="brand-mark">pe</span>
    <span><span className="brand-name">prathemesh</span><span className="brand-sub">electronics / india</span></span>
  </Link>;
}

function Header() {
  const [location, setLocation] = useLocation();
  const { cartCount } = useShop();
  const [search, setSearch] = useState('');
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (search.trim()) setLocation(`/products?q=${encodeURIComponent(search.trim())}`);
  };
  return <>
    <div className="announcement"><div className="page-wrap announcement-inner"><Sparkles size={13} /><span><strong>Republic Day tech, considered.</strong> Free delivery on orders over ₹999 across India.</span></div></div>
    <header className="site-header">
      <div className="page-wrap header-inner">
        <button className="mobile-menu" aria-label="Open menu" data-testid="button-mobile-menu"><SlidersHorizontal size={19} /></button>
        <Brand />
        <form className="header-search" onSubmit={submitSearch} data-testid="form-search">
          <input type="search" placeholder="Search phones, laptops, headphones..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search products" data-testid="input-search" />
          <Search size={17} />
        </form>
        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/products" className="header-link" data-testid="link-products"><PackageOpen size={17} /><span>Shop</span></Link>
          <Link href="/deals" className="header-link" data-testid="link-deals"><Sparkles size={17} /><span>Deals</span></Link>
          <Link href="/admin" className="header-link" data-testid="link-admin"><ShieldCheck size={17} /><span>Admin</span></Link>
          <Link href="/cart" className="header-link cart-link" data-testid="link-cart"><ShoppingBag size={18} /><span>Cart</span>{cartCount > 0 && <b className="cart-count">{cartCount}</b>}</Link>
        </nav>
      </div>
    </header>
  </>;
}

function Footer() {
  return <footer className="footer">
    <div className="page-wrap">
      <div className="footer-grid">
        <div><Brand /><p className="footer-copy">Good technology should feel obvious. We pick the useful things, price them honestly, and get them to your door without the drama.</p></div>
        <div><h4>Explore</h4><Link href="/products">All products</Link><Link href="/deals">Today&apos;s deals</Link><Link href="/products?category=smartphones">Smartphones</Link></div>
        <div><h4>Trust, built in</h4><a href="#delivery">Delivery across India</a><a href="#warranty">Brand warranty</a><a href="#support">Human support</a></div>
        <div><h4>Say hello</h4><a href="mailto:hello@prathem.es">hello@prathem.es</a><a href="tel:+919999999999">+91 99999 99999</a><span className="footer-copy">Mon–Sat, 10:00–18:00 IST</span></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Prathemesh Electronics</span><span>Made for better buying decisions.</span></div>
    </div>
  </footer>;
}

function LoadingGrid({ count = 4 }: { count?: number }) {
  return <div className="product-grid" aria-label="Loading products" data-testid="status-loading">{Array.from({ length: count }).map((_, index) => <div className="skeleton skeleton-card" key={index} />)}</div>;
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="error-state" role="alert" data-testid="status-error"><CircleAlert size={29} /><h3>That shelf didn&apos;t load.</h3><p>Our catalog is taking a quick breather. Try again in a moment.</p><button className="button button-dark" onClick={retry} data-testid="button-retry">Try again</button></div>;
}

function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-state" data-testid="status-empty"><PackageOpen size={29} /><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, hasSaved } = useShop();
  const saved = hasSaved(product.id);
  const tone = product.badgeTone === 'coral' ? 'badge-coral' : product.badgeTone === 'teal' ? 'badge-teal' : '';
  return <article className="product-card animate-rise" data-testid={`card-product-${product.id}`}>
    <div className="product-visual">
      <Link href={`/product/${product.slug}`} data-testid={`link-product-${product.id}`}><img src={imageFor(product)} alt={product.name} loading="lazy" /></Link>
      {product.badge && <span className={`badge ${tone}`}>{product.badge}</span>}
      <button className={`wishlist-btn ${saved ? 'saved' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} data-testid={`button-wishlist-${product.id}`}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="product-info">
      <span className="product-brand">{product.brand}</span>
      <Link className="product-name" href={`/product/${product.slug}`} data-testid={`link-product-name-${product.id}`}>{product.name}</Link>
      <span className="rating"><Star className="rating-star" size={12} fill="currentColor" /> {product.rating.toFixed(1)} <span>({product.reviewCount.toLocaleString('en-IN')})</span></span>
      <div className="product-bottom"><div><span className="price">{formatINR(product.price)}</span><span className="mrp">{formatINR(product.mrp)}</span><div className="discount">{product.discount}% off</div></div><button className="mini-add" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`} data-testid={`button-add-${product.id}`}><Plus size={18} /></button></div>
    </div>
  </article>;
}

function CategoryTiles({ categories }: { categories: Category[] }) {
  if (!categories.length) return <EmptyState title="More shelves, coming soon" copy="We are curating the next set of categories for you." />;
  return <div className="category-grid">{categories.slice(0, 6).map((category) => <Link href={`/products?category=${category.slug}`} className="category-tile" style={{ '--tile-accent': category.accent } as React.CSSProperties} key={category.id} data-testid={`link-category-${category.id}`}>
    <img className="category-image" src={category.image} alt="" loading="lazy" /><div><div className="category-name">{category.name}</div><div className="category-count">{category.count} considered picks</div></div>
  </Link>)}</div>;
}

function Home() {
  const home = useGetStorefrontHome();
  const categoriesQuery = useListCategories();
  const data = home.data;
  const categories = categoriesQuery.data || data?.categories || [];
  const hero = data?.heroProducts?.[0];
  return <div>
    {home.isLoading ? <main className="page-wrap section"><div className="skeleton" style={{ height: 530 }} /></main> : home.isError ? <main className="page-wrap section"><ErrorState retry={() => home.refetch()} /></main> : !data ? <main className="page-wrap section"><EmptyState title="Nothing on the shelf yet" copy="Check back shortly for the newest arrivals." /></main> : <main>
      <section className="hero page-wrap">
        <div className="hero-grid">
          <div className="hero-copy animate-rise">
            <span className="hero-kicker">The considered tech edit / 01</span>
            <h1 className="hero-title">Buy less noise.<br /><em>Get more tech.</em></h1>
            <p className="hero-desc">India&apos;s sharper electronics shelf — trusted brands, transparent pricing, and delivery you can actually plan around.</p>
            <div className="hero-actions"><Link href="/products" className="button button-primary" data-testid="button-shop-all">Shop the edit <ArrowRight size={16} /></Link><Link href="/deals" className="button button-ghost" data-testid="button-see-deals">See today&apos;s deals</Link></div>
          </div>
          <Link href={hero ? `/product/${hero.slug}` : '/products'} className="hero-aside animate-float delay-1" data-testid="link-hero-product">
            {hero ? <><img className="product-image" src={imageFor(hero)} alt={hero.name} /><span className="hero-sticker">{hero.discount}%<br />off today</span><div className="hero-aside-label"><span>{hero.brand}<br /><strong>{hero.name}</strong></span><b className="hero-price">{formatINR(hero.price)}</b></div></> : <div className="empty-state"><PackageOpen size={25} /><h3>Fresh tech soon</h3></div>}
          </Link>
        </div>
      </section>
      <section className="trust-strip"><div className="page-wrap trust-grid">
        <div className="trust-item"><Truck size={20} /><span><strong>Fast, pan-India</strong>Delivery updates that mean something</span></div>
        <div className="trust-item"><ShieldCheck size={20} /><span><strong>Genuine products</strong>Authorised brands, clean bills</span></div>
        <div className="trust-item"><RotateCcw size={20} /><span><strong>Easy returns</strong>7-day peace-of-mind window</span></div>
        <div className="trust-item"><Headphones size={20} /><span><strong>Human support</strong>Real people, not a maze</span></div>
      </div></section>
      <section className="section page-wrap"><div className="section-head"><div><span className="eyebrow">Browse by instinct</span><h2 className="section-title">Start with what<br />you&apos;re making.</h2></div><Link href="/products" className="text-link" data-testid="link-all-categories">View all categories <ChevronRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div><CategoryTiles categories={categories} /></section>
      <section className="section-tight page-wrap"><div className="section-head"><div><span className="eyebrow">The good stuff</span><h2 className="section-title">Popular right now.</h2></div><Link href="/products" className="text-link" data-testid="link-featured-products">Shop all products <ChevronRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div>{data.featuredProducts?.length ? <div className="product-grid">{data.featuredProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="The edit is loading" copy="We are lining up the best picks for the week." />}</section>
      <section className="section page-wrap"><div className="section-head"><div><span className="eyebrow">Offers with a point of view</span><h2 className="section-title">Deals, without<br />the deal-speak.</h2></div><Link href="/deals" className="text-link" data-testid="link-all-deals">See every deal <ChevronRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div><div className="deal-grid">{data.deals?.slice(0, 3).map((deal) => <DealCard key={deal.id} deal={deal} />)}</div></section>
      <BrandMarquee brands={data.brands || []} />
    </main>}
  </div>;
}

function BrandMarquee({ brands }: { brands: string[] }) {
  if (!brands.length) return null;
  return <section className="section-tight page-wrap"><div className="eyebrow" style={{ marginBottom: 17 }}>Brands we keep close</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>{brands.map((brand) => <span key={brand} style={{ border: '1px solid var(--border)', borderRadius: 99, padding: '10px 15px', font: '11px var(--app-font-mono)', color: '#626a70', background: '#fbf8f0' }}>{brand}</span>)}</div></section>;
}

function DealCard({ deal }: { deal: Deal }) {
  return <div className="deal-card" style={{ background: deal.accent || '#d9ed69' }} data-testid={`card-deal-${deal.id}`}><div><div className="deal-label">{deal.eyebrow}</div><h3 className="deal-title">{deal.title}</h3><p className="deal-description">{deal.description}</p></div><Link href={deal.productSlugs?.[0] ? `/product/${deal.productSlugs[0]}` : '/products'} className="text-link" data-testid={`link-deal-${deal.id}`}>{deal.cta} <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></Link></div>;
}

function ProductsPage() {
  const [location, setLocation] = useLocation();
  const paramsFromUrl = new URLSearchParams(location.split('?')[1] || '');
  const [query, setQuery] = useState(paramsFromUrl.get('q') || '');
  const [category, setCategory] = useState(paramsFromUrl.get('category') || '');
  const [sort, setSort] = useState('featured');
  const productsQuery = useListProducts({ q: query || undefined, category: category || undefined, limit: 50 });
  const categoriesQuery = useListCategories();
  const products = useMemo(() => {
    const list = [...(productsQuery.data || [])];
    if (sort === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') return list.sort((a, b) => b.rating - a.rating);
    return list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [productsQuery.data, sort]);
  const applyQuery = (event: React.FormEvent) => {
    event.preventDefault();
    setLocation(`/products?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(category ? { category } : {}) }).toString()}`);
  };
  return <main><section className="page-hero"><div className="page-wrap"><span className="eyebrow">The complete shelf</span><h1 className="section-title">Find the one that<br />fits your life.</h1><p className="section-copy">Search the considered edit across phones, work machines, gaming rigs, audio, screens, and the small things that make home smarter.</p></div></section>
    <div className="page-wrap catalog-layout">
      <aside className="filter-panel"><div className="filter-heading"><span>Refine your shelf</span><SlidersHorizontal size={15} /></div><form onSubmit={applyQuery}><div className="filter-group"><label htmlFor="catalog-search">Keyword</label><div className="header-search" style={{ margin: 0 }}><input id="catalog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “camera”" data-testid="input-catalog-search" /></div></div><div className="filter-group"><div className="filter-heading" style={{ margin: 0, fontSize: 12 }}>Category</div><label><input type="radio" name="category" checked={!category} onChange={() => setCategory('')} /> All products</label>{(categoriesQuery.data || []).map((item) => <label key={item.id}><input type="radio" name="category" checked={category === item.slug} onChange={() => setCategory(item.slug)} /> {item.name}</label>)}</div><button className="button button-dark" style={{ width: '100%' }} type="submit" data-testid="button-apply-filters">Apply filters</button></form></aside>
      <section><div className="catalog-toolbar"><span className="catalog-count">{productsQuery.isLoading ? 'Reading the shelf…' : `${products.length} products worth a look`}</span><select className="select-control" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" data-testid="select-sort"><option value="featured">Sort: Recommended</option><option value="rating">Sort: Top rated</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div>{productsQuery.isLoading ? <LoadingGrid count={6} /> : productsQuery.isError ? <ErrorState retry={() => productsQuery.refetch()} /> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No exact matches" copy="Try a wider search or clear the category. The right tech might be one thought away." action={<button className="button button-primary" onClick={() => { setQuery(''); setCategory(''); }} data-testid="button-clear-filters">Clear filters</button>} />}</section>
    </div>
  </main>;
}

function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const productQuery = useGetProductBySlug(slug);
  const { addToCart, toggleWishlist, hasSaved } = useShop();
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState('');
  const [checkedPincode, setCheckedPincode] = useState('');
  const product = productQuery.data;
  const gallery = product ? [product.image, ...(product.gallery || [])].filter((image, index, list) => image && list.indexOf(image) === index) : [];
  if (productQuery.isLoading) return <main className="page-wrap detail-page"><div className="skeleton" style={{ height: 600 }} /></main>;
  if (productQuery.isError || !product) return <main className="page-wrap detail-page"><ErrorState retry={() => productQuery.refetch()} /></main>;
  const saved = hasSaved(product.id);
  return <main className="detail-page"><div className="page-wrap"><div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={12} /><Link href="/products">Products</Link><ChevronRight size={12} /><span>{product.name}</span></div><div className="detail-grid">
    <div className="gallery"><div className="thumbs">{gallery.map((image, index) => <button className={`thumb ${selectedImage === index ? 'active' : ''}`} onClick={() => setSelectedImage(index)} key={image} aria-label={`View image ${index + 1}`} data-testid={`button-gallery-${index}`}><img src={image} alt="" /></button>)}</div><div className="gallery-main"><img src={gallery[selectedImage] || imageFor(product)} alt={product.name} data-testid="img-product-main" /></div></div>
     <div className="detail-copy"><span className="product-brand">{product.brand} / {product.categoryLabel}</span><h1 className="detail-name">{product.name}</h1><p className="detail-description">{product.description}</p><div className="detail-rating"><Star className="rating-star" size={14} fill="currentColor" /> {product.rating.toFixed(1)} <span>·</span> {product.reviewCount.toLocaleString('en-IN')} verified reviews <span>·</span> <span style={{ color: product.stock > 0 ? 'var(--teal)' : 'var(--coral)' }}>{product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}</span></div><div className="detail-price-row"><span className="detail-price">{formatINR(product.price)}</span><span className="mrp">{formatINR(product.mrp)}</span><span className="discount">{product.discount}% off</span></div><div className="detail-emi">{product.emi}</div><div className="variant-block"><div className="variant-title">Colour · {product.color}</div><div className="swatch-row"><button className="swatch active" style={{ background: '#607785' }} aria-label={product.color} data-testid="button-color-selected" /></div></div><div className="detail-actions"><button className="button button-primary" onClick={() => addToCart(product)} disabled={product.stock < 1} data-testid="button-add-to-cart">Add to cart <ShoppingBag size={16} /></button><button className={`button button-ghost ${saved ? 'saved' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label={saved ? 'Remove from wishlist' : 'Save product'} data-testid="button-detail-wishlist"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="delivery-box"><strong><Truck size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> {product.delivery}</strong><form onSubmit={(event) => { event.preventDefault(); if (pincode.trim()) setCheckedPincode(pincode.trim()); }} style={{ display: 'flex', gap: 7, marginTop: 10 }}><input value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter pincode" inputMode="numeric" style={{ flex: 1, border: '1px solid rgba(43,119,117,.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, background: 'rgba(255,255,255,.46)' }} data-testid="input-pincode" /><button className="button button-dark" style={{ minHeight: 33, padding: '0 12px' }} type="submit" data-testid="button-check-delivery">Check</button></form>{checkedPincode && <span style={{ display: 'block', marginTop: 8, fontSize: 11 }}>Good news — delivery available to {checkedPincode}.</span>}</div><div className="spec-list">{product.specs?.slice(0, 6).map((spec: string) => <div className="spec-item" key={spec}>{spec}</div>)}<div className="spec-item">{product.warranty} warranty</div></div></div>
  </div></div></main>;
}

function DealsPage() {
  const dealsQuery = useListDeals();
  const productsQuery = useListProducts({ limit: 50 });
  const deals = dealsQuery.data || [];
  const products = productsQuery.data || [];
  const dealProducts = products.filter((product) => deals.some((deal) => deal.productSlugs?.includes(product.slug))).slice(0, 8);
  return <main className="deals-page page-wrap">{dealsQuery.isLoading ? <LoadingGrid count={4} /> : dealsQuery.isError ? <ErrorState retry={() => dealsQuery.refetch()} /> : <><div className="deals-masthead"><div><span className="eyebrow">Live right now</span><h1 className="section-title">Good prices.<br />Short windows.</h1><p className="section-copy">No fake countdowns, no confetti. Just the offers currently worth interrupting your scroll for.</p></div><span className="mono" style={{ color: 'var(--coral)', fontSize: 11 }}>● updating as stock moves</span></div>{deals.length ? <div className="deal-list">{deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}</div> : <EmptyState title="No active deals" copy="The next good one is being negotiated." action={<Link href="/products" className="button button-primary" data-testid="button-browse-products">Browse products</Link>} />}<section className="deal-products"><div className="section-head"><div><span className="eyebrow">The deal shelf</span><h2 className="section-title" style={{ fontSize: 32 }}>Products in the mix.</h2></div></div>{productsQuery.isLoading ? <LoadingGrid count={4} /> : dealProducts.length ? <div className="product-grid">{dealProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Deal products are moving fast" copy="Head to the full catalog for everything currently available." />}</section></>}</main>;
}

function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useShop();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + delivery;
  return <main className="cart-page page-wrap"><div className="section-head"><div><span className="eyebrow">Almost yours</span><h1 className="section-title">Your cart.</h1><p className="section-copy">{cart.length ? 'A quick look before your new tech finds its place.' : 'Nothing here yet. Let’s find something that earns the space.'}</p></div></div>{cart.length === 0 ? <EmptyState title="Your cart is having a quiet day" copy="Explore the edit and save something you can see yourself using every day." action={<Link href="/products" className="button button-primary" data-testid="button-continue-shopping">Browse the edit <ArrowRight size={15} /></Link>} /> : <div className="cart-layout"><section className="cart-items">{cart.map(({ product, quantity }) => <article className="cart-item" key={product.id} data-testid={`row-cart-${product.id}`}><div className="cart-item-image"><img src={imageFor(product)} alt={product.name} /></div><div><span className="cart-item-brand">{product.brand}</span><Link className="cart-item-name" href={`/product/${product.slug}`} data-testid={`link-cart-product-${product.id}`}>{product.name}</Link><div className="cart-item-meta">{product.color} · {product.delivery}</div><div className="quantity"><button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Decrease quantity" data-testid={`button-decrease-${product.id}`}><Minus size={13} /></button><span data-testid={`text-quantity-${product.id}`}>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Increase quantity" data-testid={`button-increase-${product.id}`}><Plus size={13} /></button></div><button className="remove-button" onClick={() => removeFromCart(product.id)} data-testid={`button-remove-${product.id}`}><Trash2 size={11} style={{ verticalAlign: 'middle' }} /> Remove</button></div><div className="cart-item-price">{formatINR(product.price * quantity)}</div></article>)}</section><aside className="summary-card"><h2 className="summary-title">Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div><div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? 'Free' : formatINR(delivery)}</span></div><div className="coupon"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" aria-label="Coupon code" data-testid="input-coupon" /><button onClick={() => setCouponApplied(Boolean(coupon.trim()))} data-testid="button-apply-coupon">Apply</button></div>{couponApplied && <div style={{ color: 'var(--lime)', font: '10px var(--app-font-mono)', marginTop: -12, marginBottom: 12 }}>Coupon noted — discounts appear at checkout.</div>}<div className="summary-row total"><span>Total</span><span>{formatINR(total)}</span></div><button className="button button-primary" onClick={() => window.alert('Checkout is ready to connect.')} data-testid="button-checkout">Continue to checkout <ArrowRight size={15} /></button><div className="secure-note"><LockKeyhole size={12} /> Secure checkout · GST invoice</div></aside></div>}</main>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/products" component={ProductsPage} /><Route path="/product/:slug" component={ProductPage} /><Route path="/deals" component={DealsPage} /><Route path="/cart" component={CartPage} /><Route path="/admin" component={AdminPage} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ShopProvider><Header /><Router /><Footer /></ShopProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;