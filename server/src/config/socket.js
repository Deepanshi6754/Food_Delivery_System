let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join a room for a specific user or order
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('join_restaurant_room', (restaurantId) => {
      if (restaurantId) {
        socket.join(`restaurant_${restaurantId}`);
      }
    });

    socket.on('leave_restaurant_room', (restaurantId) => {
      if (restaurantId) {
        socket.leave(`restaurant_${restaurantId}`);
      }
    });

    socket.on('join_rider_room', (riderId) => {
      if (riderId) {
        socket.join(`rider_${riderId}`);
      }
    });

    socket.on('leave_rider_room', (riderId) => {
      if (riderId) {
        socket.leave(`rider_${riderId}`);
      }
    });

    socket.on('rider_location_update', ({ orderId, riderId, lat, lng, heading, speed }) => {
      if (orderId) {
        io.to(`order_${orderId}`).emit('rider_location_changed', {
          orderId,
          riderId,
          lat,
          lng,
          heading,
          speed,
          updatedAt: new Date()
        });
      }
    });

    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    socket.on('leave_order_room', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitOrderUpdate = (order) => {
  if (io && order) {
    // Emit to specific order room
    io.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      statusHistory: order.statusHistory,
      rider: order.rider,
      estimatedDeliveryTime: order.estimatedDeliveryTime
    });

    // Also emit to the user room
    if (order.user) {
      const userId = order.user._id ? order.user._id.toString() : order.user.toString();
      io.to(`user_${userId}`).emit('order_notification', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        message: `Your order #${order.orderNumber} is now ${order.orderStatus.replace(/_/g, ' ')}.`
      });
    }
  }
};

const emitUserNotification = (userId, notification) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

const emitToRestaurant = (restaurantId, event, data) => {
  if (io && restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
  }
};

const emitToRider = (riderId, event, data) => {
  if (io && riderId) {
    io.to(`rider_${riderId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderUpdate,
  emitUserNotification,
  emitToRestaurant,
  emitToRider
};
