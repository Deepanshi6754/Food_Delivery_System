import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ownerApi from '../../services/ownerApi';

export const ownerLogin = createAsyncThunk(
  'ownerAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post('/auth/login', { email, password });
      localStorage.setItem('owner_token', res.data.token);
      localStorage.setItem('owner_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to login as restaurant owner.'
      );
    }
  }
);

export const ownerRegister = createAsyncThunk(
  'ownerAuth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post('/auth/register', formData);
      localStorage.setItem('owner_token', res.data.token);
      localStorage.setItem('owner_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed.'
      );
    }
  }
);

export const loadOwnerMe = createAsyncThunk(
  'ownerAuth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Session expired.'
      );
    }
  }
);

export const toggleRestaurantStatus = createAsyncThunk(
  'ownerAuth/toggleStatus',
  async ({ isOpen, isTemporarilyClosed }, { rejectWithValue }) => {
    try {
      const res = await ownerApi.patch('/restaurant/status', { isOpen, isTemporarilyClosed });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update operating status.'
      );
    }
  }
);

const initialToken = localStorage.getItem('owner_token') || null;
const initialUser = localStorage.getItem('owner_user')
  ? JSON.parse(localStorage.getItem('owner_user'))
  : null;

const ownerAuthSlice = createSlice({
  name: 'ownerAuth',
  initialState: {
    token: initialToken,
    ownerUser: initialUser,
    restaurant: null,
    isAuthenticated: Boolean(initialToken),
    isLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    ownerLogout: (state) => {
      localStorage.removeItem('owner_token');
      localStorage.removeItem('owner_user');
      state.token = null;
      state.ownerUser = null;
      state.restaurant = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearOwnerError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setRestaurantData: (state, action) => {
      state.restaurant = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(ownerLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ownerLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.ownerUser = action.payload.user;
        state.restaurant = action.payload.restaurant;
      })
      .addCase(ownerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(ownerRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ownerRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.ownerUser = action.payload.user;
        state.restaurant = action.payload.restaurant;
        state.successMessage = action.payload.message;
      })
      .addCase(ownerRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load Me
      .addCase(loadOwnerMe.fulfilled, (state, action) => {
        state.ownerUser = action.payload.user;
        state.restaurant = action.payload.restaurant;
        state.isAuthenticated = true;
      })
      .addCase(loadOwnerMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.ownerUser = null;
        state.restaurant = null;
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_user');
      })
      // Toggle Status
      .addCase(toggleRestaurantStatus.fulfilled, (state, action) => {
        if (state.restaurant) {
          state.restaurant.isOpen = action.payload.isOpen;
          state.restaurant.isTemporarilyClosed = action.payload.isTemporarilyClosed;
        }
      });
  }
});

export const { ownerLogout, clearOwnerError, setRestaurantData } = ownerAuthSlice.actions;
export default ownerAuthSlice.reducer;

