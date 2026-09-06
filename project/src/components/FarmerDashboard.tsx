import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Package, TrendingUp, IndianRupee, Leaf, Store, ClipboardList, LogOut, BarChart3 } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const categories = ['Vegetables', 'Grains', 'Fruits', 'Spices'];

const defaultImage = 'https://images.pexels.com/photos/14657386/pexels-photo-14657386.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function FarmerDashboard() {
  const { profile, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Vegetables', price: '', unit: 'per kg', quantity_available: '', image_url: '', badge: '' });
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('My produce');

  const fetchProducts = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [profile]);

  const resetForm = () => {
    setForm({ name: '', category: 'Vegetables', price: '', unit: 'per kg', quantity_available: '', image_url: '', badge: '' });
    setEditing(null);
    setError('');
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      quantity_available: String(product.quantity_available),
      image_url: product.image_url ?? '',
      badge: product.badge ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!profile) return;

    const payload = {
      farmer_id: profile.id,
      name: form.name,
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      quantity_available: Number(form.quantity_available) || 0,
      image_url: form.image_url || defaultImage,
      badge: form.badge || null,
    };

    if (!payload.name || !payload.price) {
      setError('Name and price are required');
      return;
    }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { setError(error.message); return; }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { setError(error.message); return; }
    }

    resetForm();
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity_available, 0);
  const totalQty = products.reduce((sum, p) => sum + p.quantity_available, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Leaf size={21} strokeWidth={2.5} /></div>
          <div><strong>agri<span>direct</span></strong><small>farmer portal</small></div>
        </div>
        <div className="role-switcher">
          <div className="role-icon"><Store size={17} /></div>
          <div><span>Logged in as</span><b>{profile?.farm_name || profile?.full_name}</b></div>
        </div>
        <nav className="side-nav">
          <p className="nav-label">Dashboard</p>
          {[
            { label: 'My produce', icon: Package },
            { label: 'Orders', icon: ClipboardList, count: '0' },
            { label: 'Price insights', icon: BarChart3 },
          ].map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => setActiveNav(label)}>
              <Icon size={18} /> <span>{label}</span>{count && <em>{count}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="trust-card"><TrendingUp size={18} /><div><b>Selling direct</b><span>No middlemen, fair prices</span></div></div>
          <button className="profile-row" onClick={signOut} style={{ border: 0, background: 'transparent', width: '100%' }}>
            <div className="avatar">{profile?.full_name?.slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, textAlign: 'left' }}><b>{profile?.full_name}</b><span>Sign out</span></div>
            <LogOut size={15} className="muted-icon" />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Farmer</span><span>/</span><b>{activeNav}</b></div>
          <div className="top-actions">
            <button className="cart-button" onClick={() => { setShowForm(true); resetForm(); }}>
              <Plus size={17} /><span>Add produce</span>
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow"><Leaf size={14} /> Farmer dashboard</p>
              <h1>Welcome, {profile?.full_name?.split(' ')[0]}<span>.</span></h1>
              <p className="welcome-copy">Manage your listings and reach buyers directly.</p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green"><Package size={18} /></div>
              <span>Active listings</span>
              <strong>{products.length}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><IndianRupee size={18} /></div>
              <span>Total inventory value</span>
              <strong>₹{totalValue.toLocaleString('en-IN')}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Leaf size={18} /></div>
              <span>Total quantity</span>
              <strong>{totalQty}<small> kg</small></strong>
            </div>
            <div className="stat-card insight-card">
              <div>
                <span>Tip</span>
                <strong>Add photos to sell faster</strong>
                <p>Listings with images get 3x more views.</p>
              </div>
              <TrendingUp size={32} />
            </div>
          </section>

          <section className="browse-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR LISTINGS</p>
                <h2>My produce</h2>
              </div>
              <button className="text-button" onClick={() => { setShowForm(true); resetForm(); }}>
                Add new <Plus size={16} />
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#81918a', fontSize: 13 }}>Loading your listings...</p>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <Package size={24} />
                <h3>No listings yet</h3>
                <p>Add your first product to start selling.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      <img src={product.image_url ?? defaultImage} alt={product.name} />
                      {product.badge && <span>{product.badge}</span>}
                    </div>
                    <div className="product-info">
                      <div className="product-title">
                        <h3>{product.name}</h3>
                        <b>₹{product.price}<small> {product.unit}</small></b>
                      </div>
                      <p className="farm-name">{product.category}</p>
                      <p className="location">Available: {product.quantity_available} kg</p>
                      <div className="card-footer">
                        <button onClick={() => openEdit(product)} style={{ color: '#327354' }}><Pencil size={14} /> Edit</button>
                        <button onClick={() => handleDelete(product.id)} style={{ color: '#c25c4e' }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => { setShowForm(false); resetForm(); }}>
          <div className="detail-modal" style={{ gridTemplateColumns: '1fr' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => { setShowForm(false); resetForm(); }}><X size={19} /></button>
            <div className="modal-content" style={{ padding: '36px 34px' }}>
              <h2>{editing ? 'Edit listing' : 'Add new produce'}</h2>
              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: 20 }}>
                <div className="field">
                  <Leaf size={16} />
                  <input type="text" placeholder="Product name (e.g. Fresh red onions)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="field-row">
                  <select className="field-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="field">
                    <IndianRupee size={16} />
                    <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <Package size={16} />
                    <input type="number" placeholder="Quantity (kg)" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} />
                  </div>
                  <input className="field-input" type="text" placeholder="Unit (per kg)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div className="field">
                  <input type="text" placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                </div>
                <div className="field">
                  <input type="text" placeholder="Badge (e.g. Harvested today)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="primary-cta">
                  {editing ? 'Save changes' : 'Publish listing'} <ArrowRightSmall />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightSmall() {
  return <span style={{ fontSize: 15 }}>→</span>;
}
