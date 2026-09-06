import { useState } from 'react';
import { Leaf, Store, ShoppingBag, ArrowRight, Mail, Lock, User, MapPin, Sprout } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'farmer' | 'buyer'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, role, fullName, role === 'farmer' ? farmName : undefined, location || undefined);
      if (error) setError(error);
    }
    setBusy(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-mark"><Leaf size={24} strokeWidth={2.5} /></div>
          <strong>agri<span>direct</span></strong>
        </div>
        <div className="auth-hero">
          <p className="auth-eyebrow">FAIR TRADE, FRESH START</p>
          <h1>Buy closer.<br /><i>Live better.</i></h1>
          <p className="auth-tagline">Direct sourcing from verified farmers and FPOs. Better prices for buyers, fairer earnings for growers.</p>
          <div className="auth-features">
            <div className="auth-feature"><Store size={18} /><span>Farmers list and manage their own produce</span></div>
            <div className="auth-feature"><ShoppingBag size={18} /><span>Buyers browse and order directly</span></div>
            <div className="auth-feature"><Sprout size={18} /><span>Transparent pricing for everyone</span></div>
          </div>
        </div>
        <p className="auth-footer">© 2026 AgriDirect — connecting farms to tables.</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
          </div>

          {mode === 'signup' && (
            <div className="role-picker">
              <p className="role-label">I am a...</p>
              <div className="role-cards">
                <button type="button" className={`role-card ${role === 'buyer' ? 'selected' : ''}`} onClick={() => setRole('buyer')}>
                  <ShoppingBag size={22} />
                  <b>Buyer</b>
                  <span>I want to buy fresh produce</span>
                </button>
                <button type="button" className={`role-card ${role === 'farmer' ? 'selected' : ''}`} onClick={() => setRole('farmer')}>
                  <Store size={22} />
                  <b>Farmer</b>
                  <span>I want to sell my harvest</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="field">
                <User size={16} />
                <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <Mail size={16} />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <Lock size={16} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {mode === 'signup' && role === 'farmer' && (
              <>
                <div className="field">
                  <Store size={16} />
                  <input type="text" placeholder="Farm or FPO name" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                </div>
                <div className="field">
                  <MapPin size={16} />
                  <input type="text" placeholder="Location (e.g. Nashik, Maharashtra)" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </>
            )}
            {mode === 'signup' && role === 'buyer' && (
              <div className="field">
                <MapPin size={16} />
                <input type="text" placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            )}
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
