import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { Student, Interview } from '../../types';
import type { RootState } from '../store';

interface OnboardingState {
    pendingStudents: Student[];
    scheduledInterviews: Interview[];
    currentApplication: Student | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: OnboardingState = {
    pendingStudents: [],
    scheduledInterviews: [],
    currentApplication: null,
    isLoading: false,
    error: null,
};

// Fetch pending applications
export const fetchPendingApplications = createAsyncThunk(
    'onboarding/fetchPending',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/onboarding/pending`, config);
            return response.data.students;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الطلبات');
        }
    }
);

// Fetch scheduled interviews
export const fetchScheduledInterviews = createAsyncThunk(
    'onboarding/fetchInterviews',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/onboarding/interviews`, config);
            return response.data.interviews;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل المقابلات');
        }
    }
);

// Create new student application
export const createApplication = createAsyncThunk(
    'onboarding/create',
    async (data: { name: string; stage: string; guardian: any; notes?: string }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/onboarding/new`, data, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تسجيل الطالب');
        }
    }
);

// Mark form as given
export const markFormGiven = createAsyncThunk(
    'onboarding/formGiven',
    async (studentId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/onboarding/${studentId}/form-given`, {}, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث الحالة');
        }
    }
);

// Submit form with data
export const submitForm = createAsyncThunk(
    'onboarding/submitForm',
    async ({ studentId, data }: { studentId: string; data: any }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/onboarding/${studentId}/form-submitted`, data, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تقديم الاستمارة');
        }
    }
);

// Schedule interview
export const scheduleInterview = createAsyncThunk(
    'onboarding/scheduleInterview',
    async (studentId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/onboarding/${studentId}/schedule-interview`, {}, config);
            return { student: response.data.student, interview: response.data.interview };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل جدولة المقابلة');
        }
    }
);

// Set interview result
export const setInterviewResult = createAsyncThunk(
    'onboarding/interviewResult',
    async ({ studentId, result, notes, halqa }: { studentId: string; result: string; notes?: string; halqa?: string }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/onboarding/${studentId}/interview-result`, { result, notes, halqa }, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث نتيجة المقابلة');
        }
    }
);

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setCurrentApplication: (state, action: PayloadAction<Student | null>) => {
            state.currentApplication = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch pending
            .addCase(fetchPendingApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingApplications.fulfilled, (state, action: PayloadAction<Student[]>) => {
                state.isLoading = false;
                state.pendingStudents = action.payload;
            })
            .addCase(fetchPendingApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch interviews
            .addCase(fetchScheduledInterviews.fulfilled, (state, action: PayloadAction<Interview[]>) => {
                state.scheduledInterviews = action.payload;
            })
            // Create application
            .addCase(createApplication.fulfilled, (state, action: PayloadAction<Student>) => {
                state.pendingStudents.unshift(action.payload);
                state.currentApplication = action.payload;
            })
            // Mark form given
            .addCase(markFormGiven.fulfilled, (state, action: PayloadAction<Student>) => {
                const index = state.pendingStudents.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.pendingStudents[index] = action.payload;
                }
            })
            // Submit form
            .addCase(submitForm.fulfilled, (state, action: PayloadAction<Student>) => {
                const index = state.pendingStudents.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.pendingStudents[index] = action.payload;
                }
            })
            // Schedule interview
            .addCase(scheduleInterview.fulfilled, (state, action) => {
                const index = state.pendingStudents.findIndex(s => s._id === action.payload.student._id);
                if (index !== -1) {
                    state.pendingStudents[index] = action.payload.student;
                }
                if (action.payload.interview) {
                    state.scheduledInterviews.push(action.payload.interview);
                }
            })
            // Interview result
            .addCase(setInterviewResult.fulfilled, (state, action: PayloadAction<Student>) => {
                // Remove from pending if accepted/rejected
                if (['Accepted', 'Rejected'].includes(action.payload.applicationStatus || '')) {
                    state.pendingStudents = state.pendingStudents.filter(s => s._id !== action.payload._id);
                } else {
                    const index = state.pendingStudents.findIndex(s => s._id === action.payload._id);
                    if (index !== -1) {
                        state.pendingStudents[index] = action.payload;
                    }
                }
            });
    },
});

export const { setCurrentApplication, clearError } = onboardingSlice.actions;
export default onboardingSlice.reducer;
