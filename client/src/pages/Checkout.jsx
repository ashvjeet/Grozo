import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI, paymentAPI } from '../api';
import toast from 'react-hot-toast';

const BANKS_NETBANKING = [
  { id: 'sbi', name: 'State Bank of India', icon: '🏛️' },
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏢' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏗️' },
  { id: 'axis', name: 'Axis Bank', icon: '🏦' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏪' },
  { id: 'pnb', name: 'Punjab National Bank', icon: '🏫' },
  { id: 'bob', name: 'Bank of Baroda', icon: '🏬' },
  { id: 'canara', name: 'Canara Bank', icon: '🏤' },
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm', color: '#00B9F1' },
  { id: 'bhim', name: 'BHIM UPI', color: '#00796B' },
];

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment flow state
  const [activeTab, setActiveTab] = useState('card');
  const [phase, setPhase] = useState('form'); // form | otp | result
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // UPI fields
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('');

  // OTP fields
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120);
  const otpRefs = useRef([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersAPI.getOrder(orderId);
        setOrder(data.data);
        if (data.data.paymentStatus === 'completed') navigate(`/orders/${orderId}`);
        // Set active tab based on order's payment method
        if (['card', 'upi', 'netbanking'].includes(data.data.paymentMethod)) {
          setActiveTab(data.data.paymentMethod);
        }
      } catch (e) {
        toast.error('Order not found');
        navigate('/orders');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, navigate]);

  // OTP countdown
  useEffect(() => {
    if (phase !== 'otp' || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, otpTimer]);

  const formatCardNumber = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Initiate payment
  const handlePay = async () => {
    if (activeTab === 'card') {
      const num = cardNumber.replace(/\s/g, '');
      if (num.length < 16) return toast.error('Enter a valid 16-digit card number');
      if (!cardName.trim()) return toast.error('Enter cardholder name');
      if (cardExpiry.length < 5) return toast.error('Enter valid expiry (MM/YY)');
      if (cardCvv.length < 3) return toast.error('Enter valid CVV');
    } else if (activeTab === 'upi') {
      if (!upiId.trim() && !selectedUpiApp) return toast.error('Enter UPI ID or select an app');
    } else if (activeTab === 'netbanking') {
      if (!selectedBank) return toast.error('Select a bank');
    }

    setProcessing(true);
    try {
      const { data } = await paymentAPI.initiate({
        orderId: order._id,
        paymentMethod: activeTab,
        paymentDetails: activeTab === 'card'
          ? { last4: cardNumber.replace(/\s/g, '').slice(-4), network: 'Visa' }
          : activeTab === 'upi'
          ? { upiId: upiId || `${selectedUpiApp}@upi` }
          : { bank: selectedBank }
      });
      if (data.success) {
        setTransactionId(data.data.transactionId);
        setPhase('otp');
        setOtpTimer(120);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    }
    setProcessing(false);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Enter complete 6-digit OTP');

    setProcessing(true);
    try {
      const { data } = await paymentAPI.verifyOtp({
        orderId: order._id,
        transactionId,
        otp: otpString
      });
      if (data.success) {
        setPaymentResult('success');
        setPhase('result');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        setPaymentResult('failed');
        setPhase('result');
      }
    }
    setProcessing(false);
  };

  const handleRetry = () => {
    setPhase('form');
    setOtp(['', '', '', '', '', '']);
    setPaymentResult(null);
    setTransactionId('');
  };

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 500 }}></div></div>;
  if (!order) return null;

  return (
    <div className="rzp-checkout-wrapper">
      {/* Dark overlay background */}
      <div className="rzp-overlay" />

      <div className="rzp-modal">
        {/* ===== LEFT PANEL: Merchant info ===== */}
        <div className="rzp-left">
          <div className="rzp-merchant-logo">G</div>
          <div className="rzp-merchant-name">Grozo</div>
          <div className="rzp-amount">₹{order.totalAmount?.toFixed(2)}</div>
          <div className="rzp-order-id">Order: {order.orderNumber}</div>

          <div className="rzp-left-divider" />

          <div className="rzp-contact-info">
            <div className="rzp-info-row">
              <span className="rzp-info-icon">📧</span>
              <span>{order.user?.email || 'customer@grozo.in'}</span>
            </div>
            <div className="rzp-info-row">
              <span className="rzp-info-icon">📱</span>
              <span>{order.user?.phone || '+91 98765 43210'}</span>
            </div>
          </div>

          <div className="rzp-powered">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 15L12 20L17 15M7 9L12 4L17 9" stroke="#528ff0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Powered by <strong>Razorpay</strong></span>
          </div>
        </div>

        {/* ===== RIGHT PANEL: Payment forms ===== */}
        <div className="rzp-right">
          {/* Close button */}
          <button className="rzp-close" onClick={() => navigate(`/orders/${orderId}`)}>✕</button>

          <AnimatePresence mode="wait">
            {/* ===== FORM PHASE ===== */}
            {phase === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {/* Tab Selector */}
                <div className="rzp-tabs">
                  {[
                    { id: 'card', icon: '💳', label: 'Card' },
                    { id: 'upi', icon: '📱', label: 'UPI' },
                    { id: 'netbanking', icon: '🏦', label: 'Netbanking' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`rzp-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="rzp-tab-icon">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* ---- Card Tab ---- */}
                {activeTab === 'card' && (
                  <div className="rzp-form-section">
                    {/* Mini 3D Card Preview */}
                    <div className={`rzp-card-preview ${isFlipped ? 'flipped' : ''}`}>
                      <div className="rzp-card-front">
                        <div className="rzp-card-chip"></div>
                        <div className="rzp-card-number">{cardNumber || '•••• •••• •••• ••••'}</div>
                        <div className="rzp-card-row">
                          <div>
                            <div className="rzp-card-label">CARD HOLDER</div>
                            <div className="rzp-card-val">{cardName || 'YOUR NAME'}</div>
                          </div>
                          <div>
                            <div className="rzp-card-label">EXPIRES</div>
                            <div className="rzp-card-val">{cardExpiry || 'MM/YY'}</div>
                          </div>
                          <div className="rzp-card-brand">VISA</div>
                        </div>
                      </div>
                      <div className="rzp-card-back">
                        <div className="rzp-card-mag"></div>
                        <div className="rzp-card-cvv-area">
                          <span>CVV</span>
                          <div className="rzp-cvv-val">{cardCvv ? '•'.repeat(cardCvv.length) : ''}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rzp-fields">
                      <div className="rzp-field">
                        <label>Card Number</label>
                        <input type="text" placeholder="4111 1111 1111 1111" value={cardNumber} maxLength={19}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          onFocus={() => setIsFlipped(false)} />
                      </div>
                      <div className="rzp-field">
                        <label>Card Holder Name</label>
                        <input type="text" placeholder="Name on card" value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          onFocus={() => setIsFlipped(false)} />
                      </div>
                      <div className="rzp-field-row">
                        <div className="rzp-field">
                          <label>Expiry</label>
                          <input type="text" placeholder="MM/YY" value={cardExpiry} maxLength={5}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            onFocus={() => setIsFlipped(false)} />
                        </div>
                        <div className="rzp-field">
                          <label>CVV</label>
                          <input type="password" placeholder="•••" value={cardCvv} maxLength={4}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- UPI Tab ---- */}
                {activeTab === 'upi' && (
                  <div className="rzp-form-section">
                    <div className="rzp-upi-apps">
                      <p className="rzp-section-label">Pay using UPI App</p>
                      <div className="rzp-upi-grid">
                        {UPI_APPS.map(app => (
                          <button
                            key={app.id}
                            className={`rzp-upi-btn ${selectedUpiApp === app.id ? 'active' : ''}`}
                            onClick={() => { setSelectedUpiApp(app.id); setUpiId(''); }}
                          >
                            <div className="rzp-upi-dot" style={{ background: app.color }}>{app.name[0]}</div>
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rzp-divider-text"><span>OR</span></div>
                    <div className="rzp-field">
                      <label>Enter UPI ID</label>
                      <input type="text" placeholder="yourname@okaxis" value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setSelectedUpiApp(''); }} />
                    </div>
                  </div>
                )}

                {/* ---- Netbanking Tab ---- */}
                {activeTab === 'netbanking' && (
                  <div className="rzp-form-section">
                    <p className="rzp-section-label">Select your bank</p>
                    <div className="rzp-bank-grid">
                      {BANKS_NETBANKING.map(bank => (
                        <button
                          key={bank.id}
                          className={`rzp-bank-btn ${selectedBank === bank.id ? 'active' : ''}`}
                          onClick={() => setSelectedBank(bank.id)}
                        >
                          <span className="rzp-bank-icon">{bank.icon}</span>
                          <span className="rzp-bank-name">{bank.name}</span>
                          {selectedBank === bank.id && <span className="rzp-bank-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <button className="rzp-pay-btn" onClick={handlePay} disabled={processing}>
                  {processing ? (
                    <span className="rzp-btn-loading"><span className="rzp-spinner"></span>Processing...</span>
                  ) : (
                    `Pay ₹${order.totalAmount?.toFixed(2)}`
                  )}
                </button>

                <div className="rzp-secure">🔒 This payment is secured by 256-bit SSL encryption</div>
              </motion.div>
            )}

            {/* ===== OTP PHASE ===== */}
            {phase === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="rzp-otp-section">
                  <div className="rzp-otp-shield">🔐</div>
                  <h3>Verify Payment</h3>
                  <p className="rzp-otp-desc">
                    Enter the 6-digit OTP sent to your registered mobile
                    <br /><span className="rzp-otp-hint">Hint: Use <strong>123456</strong></span>
                  </p>

                  <div className="rzp-otp-boxes">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        className="rzp-otp-input"
                        value={digit}
                        maxLength={1}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="rzp-otp-timer">
                    {otpTimer > 0 ? (
                      <>Resend in <strong>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong></>
                    ) : (
                      <button className="rzp-link-btn" onClick={() => { setOtpTimer(120); toast.success('OTP resent!'); }}>Resend OTP</button>
                    )}
                  </div>

                  <div className="rzp-txn-id">
                    TXN: <code>{transactionId}</code>
                  </div>

                  <button className="rzp-pay-btn" onClick={handleVerifyOtp} disabled={processing}>
                    {processing ? (
                      <span className="rzp-btn-loading"><span className="rzp-spinner"></span>Verifying...</span>
                    ) : 'Verify & Pay'}
                  </button>

                  <button className="rzp-link-btn" onClick={handleRetry} style={{ marginTop: 12 }}>← Change payment method</button>
                </div>
              </motion.div>
            )}

            {/* ===== RESULT PHASE ===== */}
            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div className="rzp-result-section">
                  {paymentResult === 'success' ? (
                    <>
                      <motion.div
                        className="rzp-result-circle success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <motion.svg viewBox="0 0 52 52" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                          <motion.path
                            d="M14 27l7 7 16-16" fill="none" stroke="#fff" strokeWidth="3.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                          />
                        </motion.svg>
                      </motion.div>

                      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rzp-result-title success">
                        Payment Successful!
                      </motion.h3>

                      <motion.div className="rzp-result-details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <div className="rzp-detail-row"><span>Amount</span><strong>₹{order.totalAmount?.toFixed(2)}</strong></div>
                        <div className="rzp-detail-row"><span>Method</span><span style={{ textTransform: 'uppercase' }}>{activeTab}</span></div>
                        <div className="rzp-detail-row"><span>Transaction ID</span><code>{transactionId}</code></div>
                        <div className="rzp-detail-row"><span>Order</span><span>{order.orderNumber}</span></div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button className="rzp-pay-btn" style={{ flex: 1 }} onClick={() => navigate(`/orders/${orderId}`)}>View Order</button>
                        <button className="rzp-outline-btn" style={{ flex: 1 }} onClick={() => navigate('/products')}>Shop More</button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="rzp-result-circle fail"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <motion.svg viewBox="0 0 52 52" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                          <motion.path d="M16 16l20 20" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4 }} />
                          <motion.path d="M36 16l-20 20" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.6 }} />
                        </motion.svg>
                      </motion.div>

                      <h3 className="rzp-result-title fail">Payment Failed</h3>
                      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Transaction could not be completed. No amount has been deducted.</p>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="rzp-pay-btn" style={{ flex: 1 }} onClick={handleRetry}>🔄 Retry</button>
                        <button className="rzp-outline-btn" style={{ flex: 1 }} onClick={() => navigate(`/orders/${orderId}`)}>View Order</button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
