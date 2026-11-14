import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await adminApi.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user || res.data.data));
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  }
);

export const loadAdminMe = createAsyncThunk(
  'adminAuth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminApi.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired.');
    }
  }
);

const savedUser = localStorage.getItem('admin_user');
const savedToken = localStorage.getItem('admin_token');

const initialState = {
  admin: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: Boolean(savedToken),
  loading: false,
  error: null
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.user || action.payload.data;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Me
      .addCase(loadAdminMe.fulfilled, (state, action) => {
        state.admin = action.payload.user || action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(loadAdminMe.rejected, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logoutAdmin, clearAdminError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
