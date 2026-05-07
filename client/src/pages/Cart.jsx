import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryType, setDeliveryType] = useState('instant');
  const navigate = useNavigate();

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 300 }}></div></div>;

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any products yet</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    const defaultAddr = { label: 'Home', street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', location: { type: 'Point', coordinates: [72.8777, 19.076] } };
    setPlacing(true);
    try {
      const { data } = await ordersAPI.place({ deliveryAddress: defaultAddr, paymentMethod, deliveryType });
      if (data.success) {
        if (data.data.requiresPayment) {
          toast.success('Order created! Complete payment to confirm.');
          navigate(`/checkout/${data.data._id}`);
        } else {
          toast.success(`Order placed! 🎉 Earned ${data.data.pointsEarned} loyalty points`);
          navigate(`/orders/${data.data._id}`);
        }
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
    setPlacing(false);
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    try { await applyCoupon(couponCode); toast.success('Coupon applied!'); setCouponCode(''); } catch (e) { toast.error(e.response?.data?.message || 'Invalid coupon'); }
  };

  return (
    <div className="container page animate-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>🛒 Your Cart <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>({cart.itemCount} items)</span></h1>
      <div className="cart-page">
        <div className="cart-items">
          {cart.items.map(item => item.product && (
            <div className="cart-item" key={item._id}>
              <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={item.product.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h4>{item.product.name}</h4>
                <p className="unit">{item.product.unit}</p>
                <div className="qty-control" style={{ width: 120, marginTop: 8 }}>
                  <button onClick={() => item.quantity <= 1 ? removeItem(item.product._id) : updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-right">
                <button onClick={() => removeItem(item.product._id)} style={{ fontSize: 18, color: 'var(--text-muted)' }}>✕</button>
                <div>
                  <div className="price">₹{item.product.price * item.quantity}</div>
                  {item.product.discount > 0 && <div className="mrp">₹{item.product.mrp * item.quantity}</div>}
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={clearCart} style={{ alignSelf: 'flex-start', marginTop: 8 }}>🗑 Clear Cart</button>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {/* Coupon */}
          <div className="coupon-input">
            <input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button className="btn btn-secondary btn-sm" onClick={handleCoupon}>Apply</button>
          </div>
          {cart.appliedCoupon?.code && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#d1fae5', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
              <span>🎫 {cart.appliedCoupon.code}</span>
              <button onClick={removeCoupon} style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 12 }}>Remove</button>
            </div>
          )}
          <div className="summary-row"><span>Subtotal</span><span>₹{cart.subtotal?.toFixed(2)}</span></div>
          {cart.savings > 0 && <div className="summary-row"><span>Savings</span><span className="green">- ₹{cart.savings?.toFixed(2)}</span></div>}
          {cart.discount > 0 && <div className="summary-row"><span>Coupon Discount</span><span className="green">- ₹{cart.discount?.toFixed(2)}</span></div>}
          <div className="summary-row"><span>Delivery</span><span>{cart.deliveryFee === 0 ? <span className="green">FREE</span> : `₹${cart.deliveryFee}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{cart.total?.toFixed(2)}</span></div>

          {cart.savings > 0 && <div className="savings-banner">🎉 You're saving ₹{cart.savings?.toFixed(2)} on this order!</div>}

          {/* Payment Method */}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Payment Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['cod', '💵 Cash on Delivery'], ['card', '💳 Credit/Debit Card'], ['upi', '📱 UPI'], ['netbanking', '🏦 Net Banking']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${paymentMethod === val ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 14, background: paymentMethod === val ? 'var(--primary-light)' : '#fff' }}>
                  <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: 'auto' }} /> {label}
                  {val !== 'cod' && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#528ff0', fontWeight: 700, letterSpacing: 0.5 }}>Razorpay</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Type */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Delivery Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['instant', '⚡ 10-15 min'], ['scheduled', '📅 Scheduled'], ['eco', '🌿 Eco']].map(([val, label]) => (
                <button key={val} className={`btn btn-sm ${deliveryType === val ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDeliveryType(val)}>{label}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" style={{ marginTop: 20 }} onClick={handlePlaceOrder} disabled={placing}>{placing ? 'Placing Order...' : `Place Order — ₹${cart.total?.toFixed(2)}`}</button>
        </div>
      </div>
    </div>
  );
}
