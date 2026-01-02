import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { FridayConfig, FridaySchedule } from '../../types';
import type { RootState } from '../store';

interface FridayState {
    config: FridayConfig | null;
    schedule: FridaySchedule | null;
    isRecreationalDay: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: FridayState = {
    config: null,
    schedule: null,
    isRecreationalDay: false,
    isLoading: false,
    error: null,
};

// Fetch Friday config
export const fetchFridayConfig = createAsyncThunk(
    'friday/fetchConfig',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/friday/config`, config);
            return response.data.config;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل إعدادات الجمعة');
        }
    }
);

// Fetch Friday schedule
export const fetchFridaySchedule = createAsyncThunk(
    'friday/fetchSchedule',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/friday/schedule`, config);
            return {
                schedule: response.data.schedule,
                isRecreationalDay: response.data.isRecreationalDay
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل جدول الجمعة');
        }
    }
);

// Set recreational day
export const setRecreationalDay = createAsyncThunk(
    'friday/setRecreational',
    async (isRecreational: boolean, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/friday/recreational`, { isRecreational }, config);
            return { success: true, message: response.data.message, isRecreational };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الإعدادات');
        }
    }
);

// Generate Friday sessions
export const generateFridaySessions = createAsyncThunk(
    'friday/generateSessions',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/friday/generate-sessions`, {}, config);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل إنشاء الجلسات');
        }
    }
);

const fridaySlice = createSlice({
    name: 'friday',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch config
            .addCase(fetchFridayConfig.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFridayConfig.fulfilled, (state, action: PayloadAction<FridayConfig>) => {
                state.isLoading = false;
                state.config = action.payload;
                state.isRecreationalDay = action.payload.isRecreationalDay;
            })
            .addCase(fetchFridayConfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch schedule
            .addCase(fetchFridaySchedule.fulfilled, (state, action) => {
                state.schedule = action.payload.schedule;
                state.isRecreationalDay = action.payload.isRecreationalDay;
            })
            // Set recreational day
            .addCase(setRecreationalDay.fulfilled, (state, action) => {
                state.isRecreationalDay = action.payload.isRecreational;
                if (state.config) {
                    state.config.isRecreationalDay = action.payload.isRecreational;
                }
            })
            .addCase(setRecreationalDay.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = fridaySlice.actions;
export default fridaySlice.reducer;
