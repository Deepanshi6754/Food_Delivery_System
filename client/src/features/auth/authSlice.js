import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { joinUserRoom } from '../../services/socket';

const initialToken = localStorage.getItem('token') || null;
let initialUser = null;
try {
  const userStr = localStorage.getItem('user');
  if (userStr) initialUser = JSON.parse(userStr);
} catch (e) {}

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      joinUserRoom(res.data.user._id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      joinUserRoom(res.data.user._id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

export const loadMe = createAsyncThunk(
  'auth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      joinUserRoom(res.data.user._id);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to authenticate');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.put('/auth/profile', formData);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Me
      .addCase(loadMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadMe.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

