import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { User } from '../../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    isAuthenticated: !!localStorage.getItem('token'),
    error: null,
};

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { token, user };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تسجيل الدخول');
        }
    }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { auth: AuthState };
            if (state.auth.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${state.auth.token}`;
            }
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
            return response.data.user;
        } catch (error: any) {
            localStorage.removeItem('token');
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل بيانات المستخدم');
        }
    }
);

// Logout action
export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get current user
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
