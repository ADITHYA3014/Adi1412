import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { supabase, type Product, type Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const categories = ['All produce', 'Vegetables', 'Grains', 'Fruits', 'Spices'];

const defaultImage = 'https://images.pexels.com/photos/14657386/pexels-photo-14657386.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

type ProductWithFarmer = Product & { farm_name?: string | null; farmer_location?: string | null };

export default function BuyerDashboard() {
  const { profile, signOut } = useAuth();
  const [activeNav, setActiveNav] = useState('Marketplace');
  const [activeCategory, setActiveCategory] = useState('All produce');
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState<ProductWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFarmer | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id (farm_name, location)
        `)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          farm_name: row.profiles?.farm_name ?? 'Independent farmer',
          farmer_location: row.profiles?.location ?? null,
        }));
        setProducts(mapped);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All produce' || product.category === activeCategory;
      const matchesSearch = !query || `${product.name} ${product.farm_name ?? ''} ${product.farmer_location ?? ''}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, products]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const addToCart = (product: ProductWithFarmer) => {
    setCartCount((count) => count + 1);
    setSelectedProduct(null);
    notify(`${product.name} added to your order`);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMenu ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Leaf size={21} strokeWidth={2.5} /></div>
          <div><strong>agri<span>direct</span></strong><small>fair trade, fresh start</small></div>
        </div>
        <div className="role-switcher">
          <div className="role-icon"><ShoppingBag size={17} /></div>
          <div><span>Browsing as</span><b>Buyer</b></div>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {[
            { label: 'Marketplace', icon: ShoppingBag },
            { label: 'My orders', icon: ClipboardList, count: '0' },
            { label: 'Price insights', icon: BarChart3 },
          ].map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setShowMenu(false); }}>
              <Icon size={18} /> <span>{label}</span>{count && <em>{count}</em>}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">Community</p>
          <button className="nav-item" onClick={() => notify('Farmer stories are coming next')}><Users size={18} /><span>Farmer stories</span></button>
          <button className="nav-item" onClick={() => notify('Help is on the way')}><CircleHelp size={18} /><span>Help centre</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="trust-card"><ShieldCheck size={18} /><div><b>Every order is protected</b><span>Escrow payments & verified farms</span></div></div>
          <button className="profile-row" onClick={signOut} style={{ border: 0, background: 'transparent', width: '100%' }}>
            <div className="avatar">{profile?.full_name?.slice(0, 2).toUpperCase() ?? 'B'}</div>
            <div style={{ flex: 1, textAlign: 'left' }}><b>{profile?.full_name ?? 'Buyer'}</b><span>Sign out</span></div>
            <LogOut size={15} className="muted-icon" />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMenu((open) => !open)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><span>/</span><b>{activeNav}</b></div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => notify('You are all caught up')} aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="cart-button" onClick={() => notify(`${cartCount} items ready for checkout`)}><ShoppingBag size={17} /><span>Order basket</span><b>{cartCount}</b></button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div><p className="eyebrow"><Sparkles size={14} /> Fresh produce, fairly priced</p><h1>Welcome, {profile?.full_name?.split(' ')[0] ?? 'there'}<span>.</span></h1><p className="welcome-copy">Fresh from the farm, fairly priced for everyone.</p></div>
            <button className="voice-button" onClick={() => notify('Voice search is listening')}><Mic size={18} /> Search by voice</button>
          </section>

          <section className="hero-card">
            <div className="hero-copy"><span className="hero-kicker">THE DIRECT DIFFERENCE</span><h2>Buy closer.<br /><i>Live better.</i></h2><p>Discover produce directly from verified farmers and FPOs. Better prices for you, better earnings for the people who grow it.</p><button onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}>Explore fresh produce <ArrowUpRight size={17} /></button></div>
            <div className="hero-art"><div className="sun-shape" /><div className="hero-stamp"><Leaf size={17} /> 100% traceable<br /><strong>from seed to shelf</strong></div><img src="https://images.pexels.com/photos/17160606/pexels-photo-17160606.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Fresh produce at a farm market" /></div>
          </section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon green"><Users size={18} /></div><span>Farmers connected</span><strong>{products.length > 0 ? 'Live' : '—'} <small>data</small></strong><div className="mini-bar"><i style={{ width: '78%' }} /></div></div>
            <div className="stat-card"><div className="stat-icon orange"><ShieldCheck size={18} /></div><span>Listings available</span><strong>{products.length}</strong><p>fresh produce items</p></div>
            <div className="stat-card"><div className="stat-icon blue"><Truck size={18} /></div><span>In your basket</span><strong>{String(cartCount).padStart(2, '0')} <small>items</small></strong><p>Ready for checkout</p></div>
            <div className="stat-card insight-card"><div><span>Today's price insight</span><strong>Browse and compare</strong><p>Direct from farmers, no middlemen.</p></div><BarChart3 size={32} /></div>
          </section>

          <section className="browse-section" id="browse">
            <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Fresh from the network</h2></div><button className="text-button" onClick={() => { setActiveCategory('All produce'); setSearch(''); }}>View all produce <ArrowUpRight size={16} /></button></div>
            <div className="toolbar"><div className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search produce, farms or locations" /><span>⌘ K</span></div><button className="filter-button" onClick={() => notify('More filters coming soon')}><SlidersHorizontal size={17} /> Filters</button></div>
            <div className="category-row">{categories.map((category) => <button key={category} className={activeCategory === category ? 'selected' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
            {loading ? (
              <p style={{ color: '#81918a', fontSize: 13, padding: '20px 0' }}>Loading fresh produce...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state"><Search size={24} /><h3>{products.length === 0 ? 'No produce listed yet' : 'No produce found'}</h3><p>{products.length === 0 ? 'Farmers haven\'t added any listings yet. Check back soon!' : 'Try another search or browse all categories.'}</p></div>
            ) : (
              <div className="product-grid">{filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image"><img src={product.image_url ?? defaultImage} alt={product.name} />{product.badge && <span>{product.badge}</span>}<button aria-label={`Save ${product.name}`} onClick={() => notify('Saved to your favourites')}><Leaf size={15} /></button></div>
                  <div className="product-info"><div className="product-title"><h3>{product.name}</h3><b>₹{product.price}<small> {product.unit}</small></b></div><p className="farm-name"><span className="verified-dot"><Check size={10} /></span>{product.farm_name}</p><p className="location"><MapPin size={13} />{product.farmer_location ?? 'Location TBD'}</p><div className="card-footer"><span>Available <b>{product.quantity_available} kg</b></span><button onClick={() => setSelectedProduct(product)}>View details <ArrowUpRight size={14} /></button></div></div>
                </article>
              ))}</div>
            )}
          </section>

          <section className="bottom-panels"><div className="farmer-panel"><div className="panel-image"><img src="https://images.pexels.com/photos/32277759/pexels-photo-32277759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Farmer holding crops" /></div><div><p className="eyebrow">MEET THE GROWERS</p><h2>Every purchase has a story.</h2><p>Get to know the families and collectives behind your food. See how direct trade makes a difference.</p><button className="dark-button" onClick={() => notify('Farmer stories are coming next')}>Meet our farmers <ArrowUpRight size={16} /></button></div></div><div className="help-panel"><div className="help-icon"><MessageCircle size={20} /></div><p className="eyebrow">NEED A HAND?</p><h3>We're here to help you buy better.</h3><p>Our support team can help with bulk orders, delivery and more.</p><button onClick={() => notify('Support chat opened')}>Chat with support <ArrowUpRight size={15} /></button></div></section>
        </div>
      </main>

      {selectedProduct && <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}><div className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setSelectedProduct(null)} aria-label="Close"><X size={19} /></button><img src={selectedProduct.image_url ?? defaultImage} alt={selectedProduct.name} /><div className="modal-content">{selectedProduct.badge && <span className="modal-tag">{selectedProduct.badge}</span>}<h2>{selectedProduct.name}</h2><p className="modal-farm"><span className="verified-dot"><Check size={10} /></span>{selectedProduct.farm_name} · {selectedProduct.farmer_location ?? 'Location TBD'}</p><div className="modal-price"><strong>₹{selectedProduct.price}</strong><span>{selectedProduct.unit} · {selectedProduct.quantity_available} kg available</span></div><div className="modal-note"><ShieldCheck size={18} /><span>Protected purchase. Payment is released to the farmer after delivery confirmation.</span></div><button className="primary-cta" onClick={() => addToCart(selectedProduct)}>Add to order basket <ShoppingBag size={17} /></button></div></div></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}
