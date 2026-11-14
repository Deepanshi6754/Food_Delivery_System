import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {
    addSocketNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.data || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.notifications.find((n) => n._id === action.payload._id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  }
});

export const { addSocketNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

