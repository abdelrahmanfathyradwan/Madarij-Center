import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Notification } from '../../types';
import type { RootState } from '../store';

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (unreadOnly: boolean = false, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = `/api/notifications${unreadOnly ? '?unreadOnly=true' : ''}`;
            const response = await axios.get(url, config);
            return {
                notifications: response.data.notifications,
                unreadCount: response.data.unreadCount
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الإشعارات');
        }
    }
);

// Fetch unread count only
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get('/api/notifications/unread-count', config);
            return response.data.count;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل عدد الإشعارات');
        }
    }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, config);
            return response.data.notification;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الإشعار');
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('/api/notifications/read-all', {}, config);
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الإشعارات');
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    'notifications/delete',
    async (notificationId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/notifications/${notificationId}`, config);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل حذف الإشعار');
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch unread count
            .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
                state.unreadCount = action.payload;
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
                const index = state.notifications.findIndex(n => n._id === action.payload._id);
                if (index !== -1) {
                    state.notifications[index] = action.payload;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
            });
    },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
