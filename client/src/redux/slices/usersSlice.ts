import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types';

import type { RootState } from '../store';

interface UsersState {
    users: User[];
    teachers: User[];
    supervisors: User[];
    isLoading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    teachers: [],
    supervisors: [],
    isLoading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (role: string | undefined, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const query = role ? `?role=${role}` : '';
            const response = await axios.get(`/api/users${query}`, config);
            return { users: response.data.users, role };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل المستخدمين');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                const { users, role } = action.payload;
                if (!role) {
                    state.users = users;
                } else if (role === 'teacher') {
                    state.teachers = users;
                } else if (role === 'supervisor') {
                    state.supervisors = users;
                }
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default usersSlice.reducer;
