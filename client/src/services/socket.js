import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      // Re-join user room if user is logged in
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user._id) {
            socket.emit('join_user_room', user._id);
          }
        }
      } catch (e) {}
    });
  }
  return socket;
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user_room', userId);
  }
};

export const joinOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('join_order_room', orderId);
  }
};

export const leaveOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('leave_order_room', orderId);
  }
};

