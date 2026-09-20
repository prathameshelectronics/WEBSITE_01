import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Boxes,
  Check,
  CircleAlert,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'wouter';
import { useListCategories, useListProducts, type Product } from '@/lib/supabase-catalog';
import { useAdminAuth } from '@/lib/admin-auth';

type FormState = {
  name: string;
  brand: string;
  category: string;
  price: string;
  mrp: string;
  stock: string;
  image: string;
  description: string;
  featured: boolean;
};

const defaultImage =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85';

const emptyForm: FormState = {
  name: '',
  brand: '',
  category: 'smartphones',
  price: '',
  mrp: '',
  stock: '0',
  image: defaultImage,
  description: '',
  featured: false,
};

function toForm(product?: Product): FormState {
  if (!product) return emptyForm;
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: String(product.price),
    mrp: String(product.mrp),
    stock: String(product.stock),
    image: product.image,
    description: product.description,
    featured: product.featured,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function AdminMetric({
  label,
  value,
  note,
  tone = 'teal',
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'teal' | 'lime' | 'coral' | 'saffron';
}) {
  return (
    <article className={`admin-metric admin-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function AdminFormModal({
  form,
  editing,
  categories,
  onChange,
  onClose,
  onSave,
}: {
  form: FormState;
  editing?: Product;
  categories: { slug: string; name: string }[];
  onChange: (patch: Partial<FormState>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-product-dialog-title">
        <div className="admin-modal-head">
          <div>
            <span className="eyebrow">Catalog editor</span>
            <h2 id="admin-product-dialog-title">{editing ? 'Edit product' : 'Add a product'}</h2>
          </div>
          <button className="admin-icon-button" onClick={onClose} aria-label="Close product editor">
            <X size={17} />
          </button>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide">
            <span>Product name</span>
            <input value={form.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="e.g. ZenPhone 12 Pro" autoFocus />
          </label>
          <label className="admin-field">
            <span>Brand</span>
            <input value={form.brand} onChange={(event) => onChange({ brand: event.target.value })} placeholder="e.g. Zenith" />
          </label>
          <label className="admin-field">
            <span>Category</span>
            <select value={form.category} onChange={(event) => onChange({ category: event.target.value })}>
              {categories.map((category) => <option value={category.slug} key={category.slug}>{category.name}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span>Price (₹)</span>
            <input type="number" min="0" value={form.price} onChange={(event) => onChange({ price: event.target.value })} placeholder="69999" />
          </label>
          <label className="admin-field">
            <span>MRP (₹)</span>
            <input type="number" min="0" value={form.mrp} onChange={(event) => onChange({ mrp: event.target.value })} placeholder="79999" />
          </label>
          <label className="admin-field">
            <span>Stock units</span>
            <input type="number" min="0" value={form.stock} onChange={(event) => onChange({ stock: event.target.value })} placeholder="20" />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Image URL</span>
            <input value={form.image} onChange={(event) => onChange({ image: event.target.value })} placeholder="https://..." />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => onChange({ description: event.target.value })} rows={3} placeholder="Short product description" />
          </label>
          <label className="admin-checkbox admin-field-wide">
            <input type="checkbox" checked={form.featured} onChange={(event) => onChange({ featured: event.target.checked })} />
            <span>Show this product in the featured storefront shelf</span>
          </label>
        </div>
        <div className="admin-modal-foot">
          <span className="admin-form-hint"><ShieldCheck size={14} /> Preview mode saves changes in this browser.</span>
          <div className="admin-modal-actions">
            <button className="button button-ghost" onClick={onClose}>Cancel</button>
            <button className="button button-dark" onClick={onSave}><Check size={15} /> {editing ? 'Save changes' : 'Add product'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminPage() {
  const { user, signOut } = useAdminAuth();
  const productsQuery = useListProducts({ limit: 50 });
  const categoriesQuery = useListCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeView, setActiveView] = useState<'overview' | 'inventory'>('overview');
  const [editing, setEditing] = useState<Product>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (productsQuery.data && products.length === 0) setProducts(productsQuery.data);
  }, [productsQuery.data, products.length]);

  const categories = categoriesQuery.data ?? [
    { slug: 'smartphones', name: 'Smartphones' },
    { slug: 'laptops', name: 'Laptops' },
    { slug: 'audio', name: 'Audio' },
    { slug: 'televisions', name: 'Televisions' },
    { slug: 'gaming', name: 'Gaming' },
    { slug: 'wearables', name: 'Wearables' },
  ];

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !query || [product.name, product.brand, product.categoryLabel].some((value) => value.toLowerCase().includes(query));
      const matchesStock = stockFilter === 'all' || (stockFilter === 'out' ? product.stock === 0 : product.stock > 0 && product.stock <= 10);
      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 10).length;
  const featured = products.filter((product) => product.featured).length;

  function openNewProduct() {
    setEditing(undefined);
    setForm({ ...emptyForm });
    setIsModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm(toForm(product));
    setIsModalOpen(true);
  }

  function saveProduct() {
    const price = Number(form.price);
    const mrp = Number(form.mrp || form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.brand.trim() || !price || mrp < price || stock < 0) {
      setNotice('Add a name, brand, valid price, and stock amount before saving.');
      return;
    }
    const category = categories.find((item) => item.slug === form.category);
    const base = editing ?? {
      id: `admin-${Date.now()}`,
      slug: slugify(form.name),
      rating: 0,
      reviewCount: 0,
      badge: null,
      badgeTone: null,
      gallery: [form.image || defaultImage],
      specs: [],
      emi: 'EMI available on orders above ₹3,000',
      delivery: 'Delivery date set at checkout',
      color: 'Standard',
      warranty: '1 year',
    };
    const product: Product = {
      ...base,
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      categoryLabel: category?.name ?? form.category,
      price,
      mrp,
      stock,
      image: form.image || defaultImage,
      gallery: base.gallery.length ? base.gallery : [form.image || defaultImage],
      description: form.description.trim() || 'A carefully selected addition to the Prathemesh Electronics catalog.',
      discount: mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0,
      featured: form.featured,
    };
    setProducts((current) => editing ? current.map((item) => item.id === editing.id ? product : item) : [product, ...current]);
    setNotice(editing ? 'Product changes saved locally.' : 'Product added to the local catalog.');
    setEditing(undefined);
    setIsModalOpen(false);
  }

  function removeProduct(product: Product) {
    if (!window.confirm(`Remove ${product.name} from this preview catalog?`)) return;
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice(`${product.name} removed from the local catalog.`);
  }

  return (
    <main className="admin-page">
      <div className="admin-shell page-wrap">
        <aside className="admin-sidebar">
          <Link href="/" className="admin-back-link">← Back to storefront</Link>
          <div className="admin-sidebar-brand"><span className="brand-mark">pe</span><span><strong>prathemesh</strong><small>admin workspace</small></span></div>
          <nav className="admin-nav" aria-label="Admin sections">
            <button className={activeView === 'overview' ? 'active' : ''} onClick={() => setActiveView('overview')}><LayoutDashboard size={16} /> Overview</button>
            <button className={activeView === 'inventory' ? 'active' : ''} onClick={() => setActiveView('inventory')}><Boxes size={16} /> Inventory <span>{products.length}</span></button>
            <button onClick={() => setNotice('Settings will be available when admin authentication is connected.')}><Settings2 size={16} /> Settings</button>
          </nav>
          <div className="admin-sidebar-note"><Sparkles size={16} /><strong>Operations workspace</strong><p>Catalog reads are live. Product writes will persist when the Supabase admin policies are enabled.</p></div>
          <div className="admin-sidebar-user"><span>{user?.email?.slice(0, 1).toUpperCase() ?? 'A'}</span><div><strong>{user?.email ?? 'Admin account'}</strong><small>Administrator</small></div><button onClick={() => void signOut()} aria-label="Sign out"><LogOut size={15} /></button></div>
        </aside>
        <section className="admin-content">
          <header className="admin-topbar">
            <div><span className="eyebrow">Operations / catalog</span><h1>Good morning, admin.</h1><p>Keep the storefront accurate, stocked, and ready to ship.</p></div>
            <button className="button button-primary" onClick={openNewProduct}><Plus size={16} /> Add product</button>
          </header>

          <div className="admin-status"><span className="admin-status-dot" /> Catalog API connected <span>•</span> {productsQuery.isLoading ? 'Syncing products…' : `${products.length} products loaded`} <span className="admin-status-mode">Admin session verified</span></div>

          {activeView === 'overview' ? (
            <>
              <div className="admin-metrics">
                <AdminMetric label="Catalog value" value={formatINR(inventoryValue)} note="Current price × stock" tone="teal" />
                <AdminMetric label="Featured shelf" value={`${featured} products`} note="Visible on home" tone="lime" />
                <AdminMetric label="Low stock" value={`${lowStock} items`} note="10 units or fewer" tone="coral" />
                <AdminMetric label="Categories" value={`${categories.length}`} note="Active catalog groups" tone="saffron" />
              </div>
              <div className="admin-overview-grid">
                <section className="admin-panel admin-panel-wide">
                  <div className="admin-panel-head"><div><span className="eyebrow">Inventory pulse</span><h2>What needs attention.</h2></div><button className="text-link" onClick={() => setActiveView('inventory')}>View inventory <ArrowUpRight size={14} /></button></div>
                  {productsQuery.isLoading ? <div className="admin-list-skeleton" /> : <div className="admin-attention-list">{products.filter((product) => product.stock <= 10).slice(0, 4).map((product) => <button className="admin-attention-row" key={product.id} onClick={() => { setActiveView('inventory'); openEdit(product); }}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.brand} · {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}</small></span><CircleAlert size={16} /></button>)}{products.every((product) => product.stock > 10) && <div className="admin-empty-inline"><Check size={18} /> Everything is comfortably stocked.</div>}</div>}
                </section>
                <section className="admin-panel">
                  <div className="admin-panel-head"><div><span className="eyebrow">Quick actions</span><h2>Stay in control.</h2></div></div>
                  <div className="admin-quick-actions"><button onClick={openNewProduct}><Plus size={17} /><span><strong>Add a product</strong><small>Put a new item on the shelf</small></span></button><button onClick={() => setActiveView('inventory')}><Boxes size={17} /><span><strong>Review inventory</strong><small>Search, edit, or remove items</small></span></button><Link href="/"><ArrowUpRight size={17} /><span><strong>Preview storefront</strong><small>See the customer experience</small></span></Link></div>
                </section>
              </div>
              <section className="admin-panel admin-recent-panel"><div className="admin-panel-head"><div><span className="eyebrow">Latest catalog</span><h2>Recently loaded products.</h2></div><button className="text-link" onClick={() => setActiveView('inventory')}>Manage all <ArrowUpRight size={14} /></button></div><div className="admin-mini-grid">{products.slice(0, 4).map((product) => <button className="admin-mini-card" key={product.id} onClick={() => { setActiveView('inventory'); openEdit(product); }}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{formatINR(product.price)} · {product.stock} in stock</small></span></button>)}</div></section>
            </>
          ) : (
            <section className="admin-panel admin-inventory-panel">
              <div className="admin-panel-head admin-inventory-head"><div><span className="eyebrow">Catalog control</span><h2>Inventory.</h2><p>Search and update the products customers see.</p></div><button className="button button-dark" onClick={openNewProduct}><Plus size={15} /> Add product</button></div>
              <div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, brand, or category" aria-label="Search inventory" /></label><select className="select-control" value={stockFilter} onChange={(event) => setStockFilter(event.target.value as 'all' | 'low' | 'out')} aria-label="Filter stock"><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select><span className="admin-result-count">{visibleProducts.length} results</span></div>
              {productsQuery.isLoading ? <div className="admin-list-skeleton" /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.brand} · {product.slug}</small></span></div></td><td><span className="admin-category-pill">{product.categoryLabel}</span></td><td><strong>{formatINR(product.price)}</strong><small className="admin-table-muted">MRP {formatINR(product.mrp)}</small></td><td><span className={`stock-pill ${product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : ''}`}>{product.stock === 0 ? 'Out' : `${product.stock} units`}</span></td><td>{product.featured ? <span className="featured-pill"><Sparkles size={12} /> Live</span> : <span className="admin-table-muted">—</span>}</td><td><div className="admin-row-actions"><button onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button onClick={() => removeProduct(product)} aria-label={`Remove ${product.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{visibleProducts.length === 0 && <div className="admin-empty-inline">No products match this view.</div>}</div>}
            </section>
          )}
        </section>
      </div>
      {notice && <div className="toast-note" role="status"><strong>Done.</strong> {notice} <button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={13} /></button></div>}
      {isModalOpen && <AdminFormModal form={form} editing={editing} categories={categories} onChange={(patch) => setForm((current) => ({ ...current, ...patch }))} onClose={() => { setEditing(undefined); setIsModalOpen(false); }} onSave={saveProduct} />}
    </main>
  );
}