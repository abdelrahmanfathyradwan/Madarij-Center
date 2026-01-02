// User types
export type UserRole = 'director' | 'supervisor' | 'teacher' | 'student_affairs';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    roleDisplay: string;
    phone?: string;
    isActive: boolean;
    assignedHalqat?: string[];
}

// Classroom types
export interface Classroom {
    _id: string;
    name: string;
    capacity: number;
    isActive: boolean;
    description?: string;
}

// Halqa types
export type ArabicDay = 'السبت' | 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة';

export interface Halqa {
    _id: string;
    name: string;
    classroom: Classroom | string;
    teacher: User | string;
    supervisor: User | string;
    days: ArabicDay[];
    startTime: string;
    endTime: string;
    sessionDuration: number;
    maxStudents: number;
    isActive: boolean;
    studentCount?: number;
}

// Student types
export type StudentStage = 'ابتدائي' | 'إعدادي' | 'ثانوي' | 'جامعة';
export type StudentStatus = 'منتظم' | 'منقطع' | 'متوقف';
export type ApplicationStatus = 'New' | 'FormGiven' | 'FormSubmitted' | 'InterviewScheduled' | 'InterviewCompleted' | 'Accepted' | 'Rejected' | 'Pending';

export interface Guardian {
    _id: string;
    name: string;
    phone: string;
    alternatePhone?: string;
    relationship: string;
    whatsAppEnabled?: boolean;
    whatsAppPhone?: string;
}

export interface Student {
    _id: string;
    name: string;
    age?: number;
    stage: StudentStage;
    halqa?: Halqa | string;
    guardian: Guardian | string;
    status: StudentStatus;
    enrollmentDate: string;
    currentJuz: number;
    currentSurah: string;
    totalMemorized?: string;
    notes?: string;
    // Onboarding fields
    applicationStatus?: ApplicationStatus;
    interviewDate?: string;
    interviewNotes?: string;
    isActive?: boolean;
    acceptedAt?: string;
    acceptedBy?: User | string;
}

// Session types
export type SessionStatus = 'لم تبدأ' | 'بدأت' | 'انتهت';
export type DayType = 'عادي' | 'جمعة';
export type FridayActivity = 'تربوي' | 'ترفيهي';

export interface SessionStages {
    teacherReading: boolean;
    studentReading: boolean;
    tafseer: boolean;
    tasmeea: boolean;
}

export interface Session {
    _id: string;
    halqa: Halqa | string;
    date: string;
    dayType: DayType;
    status: SessionStatus;
    stages: SessionStages;
    // Direct references
    teacher?: User | string;
    supervisor?: User | string;
    studentAffairs?: User | string;
    classroom?: Classroom | string;
    timeStart?: string;
    timeEnd?: string;
    // Friday management
    fridayActivity?: FridayActivity | null;
    fridayStage?: StudentStage | null;
    isRecreationalDay?: boolean;
    recreationalDaySetAt?: string;
    fridayEducationalLevel?: StudentStage | null;
    notes?: string;
    startedAt?: string;
    endedAt?: string;
    attendanceStats?: Record<string, number>;
    totalStudents?: number;
}

// Attendance types
export type AttendanceStatus = 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن';

export interface Attendance {
    _id: string;
    student: Student | string;
    session: Session | string;
    status: AttendanceStatus;
    notes?: string;
    absenceReason?: string;
    recordedBy?: User | string;
    recordedAt?: string;
    isLate?: boolean;
    lateMinutes?: number;
}

// Performance types
export type PerformanceRating = 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'يحتاج متابعة';

export interface Performance {
    _id: string;
    session: Session | string;
    student: Student | string;
    memorizedAmount: string;
    rating: PerformanceRating;
    tajweedRating?: PerformanceRating;
    tafseerCompleted: boolean;
    notes?: string;
}

// Subscription types
export type SubscriptionStatus = 'مدفوع' | 'متأخر' | 'معفي' | 'جزئي';

export interface Subscription {
    _id: string;
    student: Student | string;
    month: string;
    year: number;
    monthNumber: number;
    status: SubscriptionStatus;
    amount: number;
    paidAmount: number;
    paidAt?: string;
    exemptionReason?: string;
}

// Expense types
export type ExpenseType = 'إيجار' | 'معلمين' | 'كهرباء' | 'مياه' | 'صيانة' | 'مستلزمات' | 'أخرى';

export interface Expense {
    _id: string;
    type: ExpenseType;
    description?: string;
    amount: number;
    date: string;
    paidTo?: string;
    isPaid: boolean;
    notes?: string;
}

// Interview types
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type InterviewResult = 'accepted' | 'rejected' | 'pending';

export interface Interview {
    _id: string;
    student: Student | string;
    scheduledDate: string;
    scheduledBy: User | string;
    conductor?: User | string;
    status: InterviewStatus;
    result?: InterviewResult | null;
    notes?: string;
    conductedAt?: string;
    dayOfWeek: 'السبت' | 'الثلاثاء';
    timeSlot: string;
}

// Notification types
export type NotificationType = 'interview_scheduled' | 'interview_reminder' | 'student_accepted' | 'student_rejected' | 'attendance_alert' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
    _id: string;
    recipient: User | string;
    type: NotificationType;
    title: string;
    message: string;
    relatedStudent?: Student | string;
    relatedInterview?: Interview | string;
    isRead: boolean;
    readAt?: string;
    priority: NotificationPriority;
    expiresAt?: string;
    createdAt: string;
}

// Communication Log types
export type CommunicationType = 'whatsapp' | 'phone' | 'in_person' | 'other';
export type CommunicationPurpose = 'attendance' | 'performance' | 'general' | 'emergency' | 'interview' | 'subscription';

export interface CommunicationLog {
    _id: string;
    student: Student | string;
    guardian: Guardian | string;
    initiatedBy: User | string;
    communicationType: CommunicationType;
    purpose: CommunicationPurpose;
    session?: Session | string;
    notes?: string;
    createdAt: string;
}

// Friday Config types
export interface FridayConfig {
    date: string;
    isRecreationalDay: boolean;
    recreationalDaySetAt?: string;
    canModify: boolean;
    isTodayFriday: boolean;
    sessions: number;
}

export interface FridayScheduleItem {
    time: string;
    type?: string;
    level?: string;
    description: string;
}

export interface FridaySchedule {
    date: string;
    isTodayFriday: boolean;
    sessions: FridayScheduleItem[];
}

// Dashboard types
export interface DashboardData {
    today: {
        date: string;
        dayName: string;
        isFriday: boolean;
        isRecreational?: boolean;
        time: string;
    };
    upcomingFriday?: {
        date: string;
        isRecreational: boolean;
        isToday: boolean;
    };
    user: User;
    stats: {
        totalStudents: number;
        totalHalqat: number;
        todaySessionsCount?: number;
        paidSubscriptions?: number;
        pendingSubscriptions?: number;
        monthlyIncome?: number;
    };
    sessions?: Session[];
    halqat?: Halqa[];
    halqa?: Halqa;
    students?: Student[];
    session?: Session;
    recentStudents?: Student[];
    pendingSubscriptions?: Subscription[];
    fridayInfo?: {
        afterFajr: string;
        afterJumaa: string;
        afterAsr: string;
        afterMaghrib: string;
    };
    alerts?: { type: string; message: string }[];
}

// Financial Summary
export interface FinancialSummary {
    period: { year: number; month: number };
    income: {
        expected: number;
        paid: number;
        pending: number;
    };
    subscriptions: {
        paid: number;
        pending: number;
        exempt: number;
        total: number;
    };
    expenses: {
        total: number;
        breakdown: { _id: string; total: number }[];
    };
    netProfit: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

