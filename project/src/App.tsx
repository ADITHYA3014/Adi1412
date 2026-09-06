import { Leaf } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import BuyerDashboard from '@/components/BuyerDashboard';
import FarmerDashboard from '@/components/FarmerDashboard';

function AppContent() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f8f3' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1f7656', display: 'grid', placeItems: 'center', color: '#fff', animation: 'pulse 1.2s ease-in-out infinite' }}>
            <Leaf size={24} strokeWidth={2.5} />
          </div>
          <p style={{ color: '#81918a', fontSize: 13 }}>Loading AgriDirect...</p>
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  if (profile?.role === 'farmer') return <FarmerDashboard />;
  return <BuyerDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
