import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';

const STATUS_COLORS = { placed: 'badge-blue', confirmed: 'badge-purple', picking: 'badge-yellow', packed: 'badge-yellow', dispatched: 'badge-yellow', out_for_delivery: 'badge-yellow', delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-red' };
const STATUS_LABELS = { placed: 'Placed', confirmed: 'Confirmed', picking: 'Picking', packed: 'Packed', dispatched: 'Dispatched', out_for_delivery: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await ordersAPI.getMyOrders({ status: filter || undefined }); setOrders(data.data || []); } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [filter]);

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 200 }}></div></div>;

  return (
    <div className="container page animate-in" style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>📦 My Orders</h1>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(s)}>{s ? STATUS_LABELS[s] : 'All'}</button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div><h3>No orders yet</h3><p>Start shopping to see your orders here</p><Link to="/products" className="btn btn-primary">Browse Products</Link></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <Link to={`/orders/${order._id}`} key={order._id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{order.orderNumber}</span>
                  <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.items?.length} items • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ))}
                  {order.items?.length > 3 && <span style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>+{order.items.length - 3}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>₹{order.totalAmount?.toFixed(2)}</div>
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
