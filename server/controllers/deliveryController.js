const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getActiveOrders = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ user: req.user._id }).populate({ path: 'activeOrders', populate: { path: 'user', select: 'name phone' } });
  if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
  res.json({ success: true, data: agent.activeOrders });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const agent = await DeliveryAgent.findOneAndUpdate(
    { user: req.user._id },
    { currentLocation: { type: 'Point', coordinates: [longitude, latitude] } },
    { new: true }
  );
  const io = req.app.get('io');
  if (io && agent.activeOrders.length > 0) {
    agent.activeOrders.forEach(orderId => {
      io.to(`order_${orderId}`).emit('deliveryLocation', { latitude, longitude, agentId: agent._id });
    });
  }
  res.json({ success: true });
});

exports.completeDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = 'delivered';
  order.actualDelivery = new Date();
  order.paymentStatus = 'completed';
  order.statusHistory.push({ status: 'delivered', note: 'Delivered successfully' });
  await order.save();

  const agent = await DeliveryAgent.findOne({ user: req.user._id });
  agent.activeOrders = agent.activeOrders.filter(id => id.toString() !== req.params.orderId);
  agent.completedOrders += 1;
  agent.earnings.today += 30;
  agent.earnings.total += 30;
  if (agent.activeOrders.length === 0) agent.isAvailable = true;
  await agent.save();

  const io = req.app.get('io');
  if (io) io.to(`user_${order.user}`).emit('orderStatusUpdate', { orderId: order._id, status: 'delivered' });

  res.json({ success: true, data: order });
});

exports.toggleOnline = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOneAndUpdate(
    { user: req.user._id },
    { isOnline: req.body.isOnline },
    { new: true }
  );
  res.json({ success: true, data: { isOnline: agent.isOnline } });
});

exports.getEarnings = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ user: req.user._id });
  if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
  res.json({ success: true, data: { earnings: agent.earnings, completedOrders: agent.completedOrders, rating: agent.rating } });
});
