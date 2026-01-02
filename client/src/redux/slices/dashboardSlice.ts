import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { DashboardData, FinancialSummary } from '../../types';
import type { RootState } from '../store';

interface DashboardState {
    data: DashboardData | null;
    financialSummary: FinancialSummary | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    financialSummary: null,
    isLoading: false,
    error: null,
};

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetch',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, config);
            return response.data.dashboard;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل لوحة التحكم');
        }
    }
);

export const fetchFinancialSummary = createAsyncThunk(
    'dashboard/fetchFinancial',
    async ({ year, month }: { year: number; month: number }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/financial/summary?year=${year}&month=${month}`, config);
            return response.data.summary;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الملخص المالي');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<DashboardData>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchFinancialSummary.fulfilled, (state, action: PayloadAction<FinancialSummary>) => {
                state.financialSummary = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
