import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/wishlist');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const toggleRestaurantWishlist = createAsyncThunk(
  'wishlist/toggleRestaurant',
  async (restaurantId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/wishlist/restaurants/${restaurantId}`);
      dispatch(fetchWishlist());
      return { restaurantId, isAdded: res.data.isAdded };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

export const toggleMenuItemWishlist = createAsyncThunk(
  'wishlist/toggleMenuItem',
  async (itemId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/wishlist/menu-items/${itemId}`);
      dispatch(fetchWishlist());
      return { itemId, isAdded: res.data.isAdded };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    restaurants: [],
    menuItems: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.restaurants || [];
        state.menuItems = action.payload.menuItems || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default wishlistSlice.reducer;

