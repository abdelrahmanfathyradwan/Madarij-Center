import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../api/config';
import type { Subscription, Expense } from '../../types';

interface FinancialState {
    subscriptions: Subscription[];
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: FinancialState = {
    subscriptions: [],
    expenses: [],
    isLoading: false,
    error: null,
    successMessage: null,
};

export const createSubscription = createAsyncThunk(
    'financial/createSubscription',
    async (data: any, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/financial/subscriptions`, data, config);
            return response.data.subscription;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تسجيل الدخل');
        }
    }
);

export const createExpense = createAsyncThunk(
    'financial/createExpense',
    async (data: any, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/financial/expenses`, data, config);
            return response.data.expense;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تسجيل المصروف');
        }
    }
);

const financialSlice = createSlice({
    name: 'financial',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Subscription
            .addCase(createSubscription.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subscriptions.push(action.payload);
                state.successMessage = 'تم تسجيل الدخل بنجاح';
            })
            .addCase(createSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Expense
            .addCase(createExpense.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.isLoading = false;
                state.expenses.push(action.payload);
                state.successMessage = 'تم تسجيل المصروف بنجاح';
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSuccess } = financialSlice.actions;
export default financialSlice.reducer;
