import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // ✅ Use this consistently

// ---- Fetch All Notifications ----
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (userId) => {
    const res = await axiosInstance.get(`/notifications/${userId}`);
    return res.data;
  }
);

// ---- Mark 1 Notification Read ----
export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id) => {
    await axiosInstance.patch(`/notifications/mark-read/${id}`);
    return id;
  }
);

// ---- Mark All Read ----
export const markAllNotificationRead = createAsyncThunk(
  "notifications/markAllRead",
  async (userId) => {
    await axiosInstance.patch(`/notifications/mark-read/user/${userId}`);
    return userId;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    loading: false,
    unread: 0,
  },
  reducers: {
    // Socket.io event
    pushNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unread += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unread = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.notifications.find((n) => n.id === id);
        if (item) item.isRead = true;
        state.unread = state.notifications.filter((n) => !n.isRead).length;
      })
      .addCase(markAllNotificationRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unread = 0;
      });
  },
});

export const { pushNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
