import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, productsAPI, ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, ordRes, prodRes] = await Promise.all([
        adminAPI.getDashboard(), adminAPI.getAllOrders({ limit: 10 }), productsAPI.getAll({ limit: 50 })
      ]);
      setDashboard(dashRes.data.data);
      setOrders(ordRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status, note: `Updated to ${status} by admin` });
      toast.success(`Order updated to ${status}`);
      fetchDashboard();
    } catch (e) { toast.error('Failed to update'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productsAPI.delete(id); toast.success('Product deleted'); fetchDashboard(); } catch (e) { toast.error('Failed'); }
  };

  const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'products', icon: '🛍️', label: 'Products' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
  ];

  const loadAnalytics = async () => {
    try { const { data } = await adminAPI.getAnalytics({ period: '30' }); setAnalytics(data.data); } catch (e) { console.error(e); }
  };

  useEffect(() => { if (tab === 'analytics' && !analytics) loadAnalytics(); }, [tab]);

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200 }}></div></div>;

  const stats = dashboard?.stats || {};

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">grozo<span style={{ color: '#f59e0b' }}>.</span> admin</div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <a key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} style={{ cursor: 'pointer' }}>{t.icon} {t.label}</a>
          ))}
          <div style={{ borderTop: '1px solid #374151', margin: '12px 0' }}></div>
          <Link to="/" style={{ padding: '12px 20px', fontSize: 14, color: '#9ca3af' }}>🏠 Back to Store</Link>
        </nav>
      </aside>

      <main className="admin-content">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="animate-in">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>Dashboard Overview</h1>
            <div className="stat-cards">
              {[
                { label: "Today's Orders", value: stats.todayOrders, icon: '📦' },
                { label: "Today's Revenue", value: `₹${(stats.todayRevenue || 0).toLocaleString()}`, icon: '💰' },
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Active Agents', value: stats.activeAgents, icon: '🚴' },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="label">{s.label}</span><span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <div className="value">{s.value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Recent Orders</h2>
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {(dashboard?.recentOrders || []).slice(0, 5).map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                    <td>{o.user?.name || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.totalAmount?.toFixed(2)}</td>
                    <td><span className={`badge ${o.status === 'delivered' ? 'badge-green' : o.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{o.status}</span></td>
                    <td><select value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                      {['placed','confirmed','picking','packed','dispatched','out_for_delivery','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="animate-in">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>All Orders</h1>
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                    <td>{o.user?.name}<br/><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.user?.email}</span></td>
                    <td>{o.items?.length}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.totalAmount?.toFixed(2)}</td>
                    <td><span className={`badge ${o.paymentStatus === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentMethod}</span></td>
                    <td><span className={`badge ${o.status === 'delivered' ? 'badge-green' : o.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{o.status}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><select value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                      {['placed','confirmed','picking','packed','dispatched','out_for_delivery','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Products ({products.length})</h1>
            </div>
            <table className="data-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f3f4f6' }} /><div><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.brand}</div></div></div></td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td>₹{p.price} <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 12 }}>₹{p.mrp}</span></td>
                    <td><span style={{ color: p.stock > 10 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{p.stock}</span></td>
                    <td>⭐ {p.ratings?.average?.toFixed(1) || 'N/A'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics */}
        {tab === 'analytics' && (
          <div className="animate-in">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>📈 Analytics (Last 30 Days)</h1>
            {analytics ? (
              <>
                <h3 style={{ marginBottom: 12 }}>Top Products</h3>
                <table className="data-table" style={{ marginBottom: 24 }}>
                  <thead><tr><th>Product</th><th>Quantity Sold</th><th>Revenue</th></tr></thead>
                  <tbody>{analytics.topProducts?.map((p, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{p._id}</td><td>{p.totalQty}</td><td style={{ fontWeight: 600 }}>₹{p.revenue?.toFixed(2)}</td></tr>))}</tbody>
                </table>
                <h3 style={{ marginBottom: 12 }}>Category Distribution</h3>
                <div className="grid-4">{analytics.categoryStats?.map((c, i) => (
                  <div key={i} className="card" style={{ padding: 16 }}><div style={{ fontWeight: 600 }}>{c._id}</div><div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.count} products • Avg ₹{c.avgPrice?.toFixed(0)}</div></div>
                ))}</div>
              </>
            ) : <div className="skeleton" style={{ height: 200 }}></div>}
          </div>
        )}
      </main>
    </div>
  );
}
