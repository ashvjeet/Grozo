import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';

const STEPS = ['placed', 'confirmed', 'picking', 'packed', 'dispatched', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { placed: 'Order Placed', confirmed: 'Confirmed', picking: 'Picking Items', packed: 'Packed', dispatched: 'Dispatched', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
const STEP_ICONS = { placed: '📋', confirmed: '✅', picking: '🛒', packed: '📦', dispatched: '🚚', out_for_delivery: '🏍️', delivered: '🎉' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await ordersAPI.getOrder(id); setOrder(data.data); } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 400 }}></div></div>;
  if (!order) return <div className="container page"><div className="empty-state"><h3>Order not found</h3></div></div>;

  const currentIdx = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try { await ordersAPI.cancel(id, 'Changed mind'); toast.success('Order cancelled'); window.location.reload(); } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel'); }
  };

  const handleReorder = async () => {
    try { await ordersAPI.reorder(id); toast.success('Items added to cart!'); navigate('/cart'); } catch (e) { toast.error('Failed to reorder'); }
  };

  return (
    <div className="container page animate-in" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Order {order.orderNumber}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['placed', 'confirmed'].includes(order.status) && <button className="btn btn-danger btn-sm" onClick={handleCancel}>Cancel Order</button>}
          {order.status === 'delivered' && <button className="btn btn-secondary btn-sm" onClick={handleReorder}>🔄 Reorder</button>}
        </div>
      </div>

      {/* Tracking Timeline */}
      {!isCancelled && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>🚚 Order Tracking</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
            <div style={{ position: 'absolute', top: 18, left: 30, right: 30, height: 3, background: '#e5e7eb', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: 18, left: 30, height: 3, background: 'var(--primary)', zIndex: 1, width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 100)}%`, transition: 'width 0.5s ease' }}></div>
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i <= currentIdx ? 'var(--primary)' : '#e5e7eb', color: i <= currentIdx ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.3s ease' }}>{STEP_ICONS[step]}</div>
                <span style={{ fontSize: 10, fontWeight: 600, marginTop: 6, color: i <= currentIdx ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>{STEP_LABELS[step]}</span>
              </div>
            ))}
          </div>
          {order.estimatedDelivery && order.status !== 'delivered' && (
            <div style={{ textAlign: 'center', marginTop: 20, padding: 12, background: 'var(--primary-light)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)' }}>⏱ Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      )}

      {isCancelled && <div style={{ padding: 16, background: '#fee2e2', borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>❌ This order was cancelled</div>}

      {/* Items */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Items ({order.items?.length})</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price}</div></div>
            <div style={{ fontWeight: 700 }}>₹{item.total?.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Bill */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Bill Details</h3>
        <div className="summary-row"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
        {order.discount > 0 && <div className="summary-row"><span>Discount</span><span className="green">- ₹{order.discount?.toFixed(2)}</span></div>}
        <div className="summary-row"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
        <div className="summary-row"><span>Taxes</span><span>₹{order.taxes?.toFixed(2)}</span></div>
        <div className="summary-row total"><span>Total Paid</span><span>₹{order.totalAmount?.toFixed(2)}</span></div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Payment: {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}</div>
      </div>
    </div>
  );
}
