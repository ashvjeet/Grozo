const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate a dummy transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// @desc    Initiate a payment for an order
// @route   POST /api/payment/initiate
exports.initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, paymentDetails } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (order.paymentStatus === 'completed') {
    return res.status(400).json({ success: false, message: 'Payment already completed' });
  }

  const transactionId = generateTransactionId();

  // Update order with payment processing state
  order.paymentStatus = 'processing';
  order.paymentId = transactionId;
  await order.save();

  // Simulate gateway processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  res.json({
    success: true,
    data: {
      transactionId,
      orderId: order._id,
      amount: order.totalAmount,
      paymentMethod,
      status: 'otp_required',
      message: 'OTP has been sent to your registered mobile number'
    }
  });
});

// @desc    Verify OTP for payment
// @route   POST /api/payment/verify-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { orderId, transactionId, otp } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (order.paymentId !== transactionId) {
    return res.status(400).json({ success: false, message: 'Invalid transaction' });
  }

  // Simulate OTP verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Dummy OTP validation — "123456" always succeeds
  if (otp !== '123456') {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again. (Hint: use 123456)',
      attemptsRemaining: 2
    });
  }

  // Payment successful
  order.paymentStatus = 'completed';
  order.status = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: `Payment completed via ${order.paymentMethod.toUpperCase()} (${transactionId})`
  });
  await order.save();

  res.json({
    success: true,
    data: {
      transactionId,
      orderId: order._id,
      status: 'success',
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      completedAt: new Date().toISOString(),
      message: 'Payment successful!'
    }
  });
});

// @desc    Simulate payment gateway callback
// @route   POST /api/payment/callback
exports.paymentCallback = asyncHandler(async (req, res) => {
  const { orderId, transactionId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // 90% success rate
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Payment auto-verified via gateway callback (${transactionId})`
    });
  } else {
    order.paymentStatus = 'failed';
    order.statusHistory.push({
      status: 'placed',
      timestamp: new Date(),
      note: `Payment failed (${transactionId}). Please retry.`
    });
  }
  await order.save();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('paymentUpdate', {
      orderId: order._id,
      status: isSuccess ? 'success' : 'failed',
      transactionId
    });
  }

  res.json({
    success: true,
    data: {
      transactionId,
      orderId: order._id,
      status: isSuccess ? 'success' : 'failed',
      message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed'
    }
  });
});
