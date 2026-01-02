import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import halqatReducer from './slices/halqatSlice';
import studentsReducer from './slices/studentsSlice';
import sessionsReducer from './slices/sessionsSlice';
import usersReducer from './slices/usersSlice';
import classroomsReducer from './slices/classroomsSlice';
import financialReducer from './slices/financialSlice';
import onboardingReducer from './slices/onboardingSlice';
import notificationsReducer from './slices/notificationsSlice';
import fridayReducer from './slices/fridaySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        halqat: halqatReducer,
        students: studentsReducer,
        sessions: sessionsReducer,
        users: usersReducer,
        classrooms: classroomsReducer,
        financial: financialReducer,
        onboarding: onboardingReducer,
        notifications: notificationsReducer,
        friday: fridayReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

