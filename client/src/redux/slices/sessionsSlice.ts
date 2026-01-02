import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Session, Attendance, Performance } from '../../types';
import type { RootState } from '../store';

export interface SessionsState {
    todaySessions: Session[];
    currentSession: (Session & { students?: any[] }) | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SessionsState = {
    todaySessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
};

export const fetchSessions = createAsyncThunk(
    'sessions/fetchAll',
    async ({ startDate, endDate }: { startDate?: string, endDate?: string } = {}, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { startDate, endDate }
            };
            const response = await axios.get('/api/sessions', config);
            return response.data.sessions;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الجلسات');
        }
    }
);

// Deprecated: Kept for backward compatibility if needed, but fetchSessions handles it
export const fetchTodaySessions = createAsyncThunk(
    'sessions/fetchToday',
    async (_, { dispatch }) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return dispatch(fetchSessions({
            startDate: today.toISOString(),
            endDate: today.toISOString()
        })).unwrap();
    }
);

export const fetchSession = createAsyncThunk(
    'sessions/fetchOne',
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`/api/sessions/${id}`, config);
            return response.data.session;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الجلسة');
        }
    }
);

export const createSession = createAsyncThunk(
    'sessions/create',
    async (sessionData: Partial<Session>, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post('/api/sessions', sessionData, config);
            return response.data.session;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل إنشاء الجلسة');
        }
    }
);

export const updateSession = createAsyncThunk(
    'sessions/update',
    async ({ id, data }: { id: string; data: Partial<Session> }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`/api/sessions/${id}`, data, config);
            return response.data.session;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الجلسة');
        }
    }
);

export const saveAttendance = createAsyncThunk(
    'sessions/saveAttendance',
    async ({ sessionId, attendance }: { sessionId: string; attendance: Partial<Attendance>[] }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`/api/sessions/${sessionId}/attendance`, { attendance }, config);
            return response.data.attendance;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل حفظ الحضور');
        }
    }
);

export const savePerformance = createAsyncThunk(
    'sessions/savePerformance',
    async ({ sessionId, performances }: { sessionId: string; performances: Partial<Performance>[] }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`/api/sessions/${sessionId}/performance`, { performances }, config);
            return response.data.performances;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل حفظ الأداء');
        }
    }
);

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        clearCurrentSession: (state) => {
            state.currentSession = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSessions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSessions.fulfilled, (state, action: PayloadAction<Session[]>) => {
                state.isLoading = false;
                state.todaySessions = action.payload; // We can reuse this field or semantic rename
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Deprecated handlers kept for safety if todaySessions thunk is called
            .addCase(fetchTodaySessions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTodaySessions.fulfilled, (state, action: PayloadAction<Session[]>) => {
                state.isLoading = false;
                state.todaySessions = action.payload;
            })
            .addCase(fetchTodaySessions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.currentSession = action.payload;
            })
            .addCase(createSession.fulfilled, (state, action: PayloadAction<Session>) => {
                state.todaySessions.push(action.payload);
            })
            .addCase(updateSession.fulfilled, (state, action: PayloadAction<Session>) => {
                const index = state.todaySessions.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.todaySessions[index] = action.payload;
                }
                if (state.currentSession?._id === action.payload._id) {
                    state.currentSession = { ...state.currentSession, ...action.payload };
                }
            });
    },
});

export const { clearCurrentSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;
