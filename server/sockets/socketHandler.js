module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific room for order updates
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join order-specific room for delivery tracking
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Joined order tracking: ${orderId}`);
    });

    // Delivery agent location update
    socket.on('agentLocation', (data) => {
      const { orderId, latitude, longitude, agentId } = data;
      io.to(`order_${orderId}`).emit('deliveryLocation', {
        latitude,
        longitude,
        agentId,
        timestamp: new Date()
      });
    });

    // Admin room for real-time dashboard
    socket.on('joinAdmin', () => {
      socket.join('admin_dashboard');
      console.log('Admin joined dashboard room');
    });

    // Delivery agent goes online/offline
    socket.on('agentStatus', (data) => {
      io.to('admin_dashboard').emit('agentStatusUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
