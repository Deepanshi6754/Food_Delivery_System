import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import riderApi from '../../services/riderApi';

// Thunks
export const riderLogin = createAsyncThunk('riderAuth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await riderApi.post('/auth/login', credentials);
    const user = data.data || data.user || data;
    localStorage.setItem('rider_token', data.token);
    localStorage.setItem('rider_user', JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const riderRegister = createAsyncThunk('riderAuth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await riderApi.post('/auth/register', formData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadRiderMe = createAsyncThunk('riderAuth/loadMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await riderApi.get('/auth/me');
    const user = data.data || data.user || data;
    localStorage.setItem('rider_user', JSON.stringify(user));
    return user;
  } catch (err) {
    localStorage.removeItem('rider_token');
    localStorage.removeItem('rider_user');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const toggleRiderAvailability = createAsyncThunk('riderAuth/toggleAvailability', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await riderApi.patch('/availability/toggle', payload || {});
    return data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle availability');
  }
});

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('rider_user')); } catch { return null; }
})();

const riderAuthSlice = createSlice({
  name: 'riderAuth',
  initialState: {
    user: storedUser || null,
    riderProfile: null,
    isAuthenticated: !!localStorage.getItem('rider_token'),
    isLoading: false,
    error: null,
    registerSuccess: false,
  },
  reducers: {
    riderLogout: (state) => {
      state.user = null;
      state.riderProfile = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('rider_token');
      localStorage.removeItem('rider_user');
    },
    clearRiderError: (state) => { state.error = null; },
    clearRegisterSuccess: (state) => { state.registerSuccess = false; },
    setRiderProfile: (state, action) => { state.riderProfile = action.payload; },
    updateAvailabilityLocal: (state, action) => {
      if (state.riderProfile) {
        state.riderProfile.isOnline = action.payload.isOnline;
        state.riderProfile.isAvailable = action.payload.isAvailable;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(riderLogin.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(riderLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(riderLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(riderRegister.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(riderRegister.fulfilled, (state) => {
        state.isLoading = false;
        state.registerSuccess = true;
      })
      .addCase(riderRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loadRiderMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadRiderMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(toggleRiderAvailability.fulfilled, (state, action) => {
        if (state.riderProfile && action.payload) {
          state.riderProfile.isOnline = action.payload.isOnline ?? state.riderProfile.isOnline;
          state.riderProfile.isAvailable = action.payload.isAvailable ?? state.riderProfile.isAvailable;
        }
      });
  },
});

export const { riderLogout, clearRiderError, clearRegisterSuccess, setRiderProfile, updateAvailabilityLocal } = riderAuthSlice.actions;
export default riderAuthSlice.reducer;
