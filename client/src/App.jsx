import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import SpendingInsights from './pages/SpendingInsights';
import Profile from './pages/Profile';
import MealPlanner from './pages/MealPlanner';
import DeliveryPortal from './pages/DeliveryPortal';
import DeliveryLogin from './pages/DeliveryLogin';
import { useAuth } from './context/AuthContext';

function Layout({ children, hideNav }) {
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
      {!hideNav && <Footer />}
    </>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>grozo<span style={{ color: '#f59e0b' }}>.</span></div>;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontFamily: 'Inter', fontSize: 14, borderRadius: 10, padding: '10px 16px' } }} />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout hideNav><Login /></Layout>} />
        <Route path="/register" element={<Layout hideNav><Register /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
        <Route path="/checkout/:orderId" element={<Layout><Checkout /></Layout>} />
        <Route path="/spending" element={<Layout><SpendingInsights /></Layout>} />
        <Route path="/meal-planner" element={<Layout><MealPlanner /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/delivery/login" element={<Layout hideNav><DeliveryLogin /></Layout>} />
        <Route path="/delivery" element={<Layout hideNav><DeliveryPortal /></Layout>} />
        <Route path="*" element={<Layout><div className="container page"><div className="empty-state"><div className="icon">🔍</div><h3>Page not found</h3><p>The page you're looking for doesn't exist</p></div></div></Layout>} />
      </Routes>
    </>
  );
}
