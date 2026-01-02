import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Classroom } from '../../types';
import type { RootState } from '../store';

interface ClassroomsState {
    classrooms: Classroom[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ClassroomsState = {
    classrooms: [],
    isLoading: false,
    error: null,
};

export const fetchClassrooms = createAsyncThunk(
    'classrooms/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get('/api/classrooms', config);
            return response.data.classrooms;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الفصول');
        }
    }
);

const classroomsSlice = createSlice({
    name: 'classrooms',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassrooms.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClassrooms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classrooms = action.payload;
            })
            .addCase(fetchClassrooms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default classroomsSlice.reducer;
