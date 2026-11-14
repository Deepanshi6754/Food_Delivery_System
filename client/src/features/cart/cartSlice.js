import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/cart');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart/items', payload);
      return res.data.data;
    } catch (err) {
      if (err.response?.status === 409) {
        return rejectWithValue({
          conflict: true,
          message: err.response.data.message,
          pendingPayload: payload
        });
      }
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete('/cart');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      return { cart: res.data.data, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to apply coupon');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete('/cart/coupon');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove coupon');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    items: [],
    restaurant: null,
    subtotal: 0,
    deliveryFee: 0,
    taxes: 0,
    discount: 0,
    finalAmount: 0,
    appliedCoupon: null,
    isSidebarOpen: false,
    loading: false,
    error: null,
    conflictModal: {
      isOpen: false,
      message: '',
      pendingPayload: null
    }
  },
  reducers: {
    toggleSidebar: (state, action) => {
      state.isSidebarOpen = action.payload !== undefined ? action.payload : !state.isSidebarOpen;
    },
    closeConflictModal: (state) => {
      state.conflictModal = {
        isOpen: false,
        message: '',
        pendingPayload: null
      };
    },
    resetCart: (state) => {
      state.cart = null;
      state.items = [];
      state.restaurant = null;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.taxes = 0;
      state.discount = 0;
      state.finalAmount = 0;
      state.appliedCoupon = null;
    }
  },
  extraReducers: (builder) => {
    const handleCartUpdate = (state, action) => {
      state.loading = false;
      const cart = action.payload.cart || action.payload;
      state.cart = cart;
      state.items = cart.items || [];
      state.restaurant = cart.restaurant || null;
      state.subtotal = cart.subtotal || 0;
      state.deliveryFee = cart.deliveryFee || 0;
      state.taxes = cart.taxes || 0;
      state.discount = cart.discount || 0;
      state.finalAmount = cart.finalAmount || 0;
      state.appliedCoupon = cart.appliedCoupon || null;
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, handleCartUpdate)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        handleCartUpdate(state, action);
        state.isSidebarOpen = true; // Auto open sidebar when item is added
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.conflict) {
          state.conflictModal = {
            isOpen: true,
            message: action.payload.message,
            pendingPayload: action.payload.pendingPayload
          };
        } else {
          state.error = action.payload;
        }
      })
      // Update Quantity
      .addCase(updateQuantity.fulfilled, handleCartUpdate)
      // Remove Item
      .addCase(removeItem.fulfilled, handleCartUpdate)
      // Clear Cart
      .addCase(clearCart.fulfilled, handleCartUpdate)
      // Apply Coupon
      .addCase(applyCoupon.fulfilled, handleCartUpdate)
      // Remove Coupon
      .addCase(removeCoupon.fulfilled, handleCartUpdate);
  }
});

export const { toggleSidebar, closeConflictModal, resetCart } = cartSlice.actions;
export default cartSlice.reducer;

