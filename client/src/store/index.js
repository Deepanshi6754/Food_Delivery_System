import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import ownerAuthReducer from '../features/owner/ownerAuthSlice';
import riderAuthReducer from '../features/rider/riderAuthSlice';
import adminAuthReducer from '../features/admin/adminAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    notifications: notificationReducer,
    ownerAuth: ownerAuthReducer,
    riderAuth: riderAuthReducer,
    adminAuth: adminAuthReducer,
  }
});

export default store;
