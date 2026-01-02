import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { Halqa } from '../../types';
import type { RootState } from '../store';

interface HalqatState {
    halqat: Halqa[];
    currentHalqa: Halqa | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: HalqatState = {
    halqat: [],
    currentHalqa: null,
    isLoading: false,
    error: null,
};

export const fetchHalqat = createAsyncThunk(
    'halqat/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/halqat`, config);
            return response.data.halqat;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الحلقات');
        }
    }
);

export const fetchHalqa = createAsyncThunk(
    'halqat/fetchOne',
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/halqat/${id}`, config);
            return response.data.halqa;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الحلقة');
        }
    }
);

export const createHalqa = createAsyncThunk(
    'halqat/create',
    async (halqaData: Partial<Halqa>, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/halqat`, halqaData, config);
            return response.data.halqa;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل إنشاء الحلقة');
        }
    }
);

export const updateHalqa = createAsyncThunk(
    'halqat/update',
    async ({ id, data }: { id: string; data: Partial<Halqa> }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/halqat/${id}`, data, config);
            return response.data.halqa;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الحلقة');
        }
    }
);

export const deleteHalqa = createAsyncThunk(
    'halqat/delete',
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/api/halqat/${id}`, config);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل حذف الحلقة');
        }
    }
);

const halqatSlice = createSlice({
    name: 'halqat',
    initialState,
    reducers: {
        clearCurrentHalqa: (state) => {
            state.currentHalqa = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHalqat.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchHalqat.fulfilled, (state, action: PayloadAction<Halqa[]>) => {
                state.isLoading = false;
                state.halqat = action.payload;
            })
            .addCase(fetchHalqat.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchHalqa.fulfilled, (state, action: PayloadAction<Halqa>) => {
                state.currentHalqa = action.payload;
            })
            .addCase(updateHalqa.fulfilled, (state, action: PayloadAction<Halqa>) => {
                const index = state.halqat.findIndex(h => h._id === action.payload._id);
                if (index !== -1) {
                    state.halqat[index] = action.payload;
                }
            })
            .addCase(deleteHalqa.fulfilled, (state, action: PayloadAction<string>) => {
                state.halqat = state.halqat.filter(h => h._id !== action.payload);
            });
    },
});

export const { clearCurrentHalqa } = halqatSlice.actions;
export default halqatSlice.reducer;
