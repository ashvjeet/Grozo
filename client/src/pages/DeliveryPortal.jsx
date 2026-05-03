import { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineClock, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineRefresh } from 'react-icons/hi';
import { io } from 'socket.io-client';

export default function DeliveryPortal() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersAPI.getActiveOrders();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Listen for new orders via socket
    const socket = io('/', { path: '/socket.io' });
    socket.on('connect', () => {
      console.log('Delivery Portal connected to socket');
      socket.emit('joinRoom', 'delivery_partners'); // Let's assume we have a room or we just refresh
    });

    // In a real app, we'd listen for specific events. For now, refresh periodically.
    const interval = setInterval(fetchOrders, 30000); // 30s auto-refresh
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus, note: `Status updated by delivery partner to ${newStatus}` });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getNextStatusAction = (currentStatus, orderId) => {
    switch(currentStatus) {
      case 'packed':
        return <button className="btn btn-primary" style={{ width: '100%', background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => updateStatus(orderId, 'dispatched')}>Mark as Dispatched 📦</button>;
      case 'dispatched':
        return <button className="btn btn-primary" style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => updateStatus(orderId, 'out_for_delivery')}>Start Delivery 🚚</button>;
      case 'out_for_delivery':
        return <button className="btn btn-primary" style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }} onClick={() => updateStatus(orderId, 'delivered')}>Confirm Delivery ✅</button>;
      default:
        return <button className="btn btn-outline" style={{ width: '100%' }} disabled>Waiting for Store ({currentStatus})</button>;
    }
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', marginTop: 100 }}>Loading active orders...</div>;
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', paddingBottom: 80, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '20px 20px 30px', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>grozo<span style={{ color: '#f59e0b' }}>.</span> Partner</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, opacity: 0.9 }}>Delivery Dashboard</p>
          </div>
          <button onClick={fetchOrders} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <HiOutlineRefresh size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: -20 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Tasks</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{orders.filter(o => ['dispatched', 'out_for_delivery'].includes(o.status)).length}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Ready at Store</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{orders.filter(o => o.status === 'packed').length}</div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Live Orders</h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 16 }}>
            <HiOutlineCheckCircle size={48} style={{ color: '#10b981', marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, margin: '0 0 8px' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>There are no active orders right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* Status Bar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: order.status === 'out_for_delivery' ? '#fdf2f8' : order.status === 'packed' ? '#fffbeb' : '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Order #{order.orderNumber}</div>
                  <span className={`badge ${order.status === 'out_for_delivery' ? 'badge-blue' : 'badge-yellow'}`} style={{ fontSize: 11, padding: '4px 8px' }}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ padding: 16 }}>
                  {/* Customer Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{order.user?.name || 'Customer'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
                        <HiOutlinePhone /> {order.user?.phone || 'No phone provided'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                        <HiOutlineLocationMarker style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>
                          {order.deliveryAddress?.apartment ? `${order.deliveryAddress.apartment}, ` : ''}
                          {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Items</span>
                      <span style={{ fontWeight: 600 }}>{order.items?.length} items</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount to Collect</span>
                      <span style={{ fontWeight: 700, color: order.paymentMethod === 'cod' ? '#dc2626' : '#10b981' }}>
                        {order.paymentMethod === 'cod' ? `₹${order.totalAmount.toFixed(2)} (COD)` : 'PAID'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Time Elapsed</span>
                      <span style={{ fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HiOutlineClock /> {Math.round((new Date() - new Date(order.createdAt)) / 60000)} mins
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {getNextStatusAction(order.status, order._id)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
