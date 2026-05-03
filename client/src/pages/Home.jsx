import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { HiOutlineLightningBolt, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  'Fruits & Vegetables': '🥬', 'Dairy & Breakfast': '🥛', 'Snacks & Munchies': '🍿',
  'Cold Drinks & Juices': '🧃', 'Instant & Frozen Food': '🍜', 'Tea, Coffee & Health Drink': '☕',
  'Bakery & Biscuits': '🍪', 'Sweet Tooth': '🍬', 'Atta, Rice & Dal': '🌾',
  'Dry Fruits, Masala & Oil': '🥜', 'Cleaning Essentials': '🧹', 'Personal Care': '🧴',
  'Organic & Healthy Living': '🌿', 'Baby Care': '👶', 'Pet Care': '🐾'
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          productsAPI.getAll({ limit: 20, sort: '-purchaseCount' }),
          productsAPI.getCategories(),
          productsAPI.getFlashDeals()
        ];
        
        if (isAuthenticated) {
          promises.push(productsAPI.getRecommendations());
        }

        const [prodRes, catRes, flashRes, recRes] = await Promise.all(promises);
        
        setProducts(prodRes.data.data || []);
        setCategories(catRes.data.data || []);
        setFlashDeals(flashRes.data.data || []);
        if (recRes) {
          setRecommendations(recRes.data.data || []);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [isAuthenticated]);

  if (loading) return (
    <div className="container page">
      <div className="hero skeleton" style={{ height: 200 }}></div>
      <div className="grid-5 mt-3">{Array(10).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 280 }}></div>)}</div>
    </div>
  );

  return (
    <div className="container page animate-in">
      {/* Hero Banner */}
      <div className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-pattern-2"></div>
        <h1>Groceries delivered<br />in 10 minutes ⚡</h1>
        <p>Fresh produce, dairy essentials, snacks & more — brought to your doorstep with AI-powered smart recommendations.</p>
        <Link to="/products" className="hero-cta">
          <HiOutlineLightningBolt /> Start Shopping
        </Link>
      </div>

      {/* Feature Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '24px 0' }}>
        {[
          { icon: <HiOutlineClock />, title: '10-Min Delivery', desc: 'Lightning fast' },
          { icon: <HiOutlineTruck />, title: 'Free Delivery', desc: 'Orders above ₹199' },
          { icon: <HiOutlineShieldCheck />, title: 'Fresh Guarantee', desc: '100% quality assured' },
          { icon: <HiOutlineLightningBolt />, title: 'Best Prices', desc: 'Save up to 40%' }
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
            <div><div style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="section-header"><h2>Shop by Category</h2><Link to="/products">View All →</Link></div>
      <div className="categories-scroll">
        {categories.map((cat) => (
          <Link to={`/products?category=${encodeURIComponent(cat._id)}`} key={cat._id} className="category-chip">
            <span className="cat-icon">{CATEGORY_ICONS[cat._id] || '📦'}</span>
            <span className="cat-name">{cat._id}</span>
          </Link>
        ))}
      </div>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <>
          <div className="section-header mt-3">
            <h2>⚡ Flash Deals</h2>
            <Link to="/products?isFlashDeal=true">See All →</Link>
          </div>
          <div className="grid-5">{flashDeals.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}</div>
        </>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ background: 'linear-gradient(to right, #fdf4ff, #faf5ff)', padding: '24px', margin: '32px -24px', borderRadius: 20, border: '1px solid #f3e8ff' }}>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🧠</span>
              <h2 style={{ background: 'linear-gradient(to right, #9333ea, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Smart Recommendations</h2>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Based on your past orders, we think you'll love these items.</p>
          <div className="grid-5">{recommendations.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      )}

      {/* Popular Products */}
      <div className="section-header mt-3"><h2>🔥 Popular Right Now</h2><Link to="/products">See All →</Link></div>
      <div className="grid-5">{products.slice(0, 10).map(p => <ProductCard key={p._id} product={p} />)}</div>

      {/* Organic Section */}
      <div className="section-header mt-3"><h2>🌿 Organic & Farm Fresh</h2><Link to="/products?isOrganic=true">See All →</Link></div>
      <div className="grid-5">{products.filter(p => p.isOrganic).slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}</div>

      {/* Why Grozo Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', borderRadius: 20, padding: '40px 32px', margin: '32px 0', color: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 16 }}>Why choose Grozo? 💚</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['🧠 AI-powered smart recommendations', '📦 Predictive auto-replenishment', '🥦 AI Meal Planner + auto grocery list', '🛍️ Group ordering for families', '🧾 Pantry management system', '🎮 Earn rewards & loyalty points', '🧑‍🌾 Direct from farm marketplace', '🚴 Eco-friendly delivery options'].map((f, i) => (
              <div key={i} style={{ fontSize: 15, opacity: 0.95 }}>{f}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🛒</div>
        </div>
      </div>
    </div>
  );
}
