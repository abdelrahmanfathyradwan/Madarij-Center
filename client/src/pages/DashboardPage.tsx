// ... (imports remain the same)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchDashboard, fetchFinancialSummary } from '../redux/slices/dashboardSlice';
import { fetchPendingApplications, fetchScheduledInterviews } from '../redux/slices/onboardingSlice';
import {
    Users,
    BookOpen,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Sun,
    Moon as MoonIcon,
    Sunrise,
    Sunset,
    ArrowLeft,
    UserPlus,
    FileText,
    Sparkles
} from 'lucide-react';

// ... (StatCard, Alert, SessionCard, FridaySchedule components remain the same)
// Recreational Banner Component
const RecreationalBanner = ({ date, isToday }: { date: string, isToday: boolean }) => {
    const formattedDate = new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg animate-fadeIn mb-2">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black/10 blur-xl"></div>
            <div className="relative z-10 flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-inner">
                    <Sparkles size={32} className="text-yellow-300 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-1">{isToday ? 'يوم ترفيهي' : 'بإذن الله'}</h2>
                    <p className="text-indigo-100 text-lg">
                        {isToday
                            ? 'اليوم ترفيهي بجانب الجلسات التعليمية!'
                            : `الجمعة القادمة (${formattedDate}) ستكون يوماً ترفيهياً ممتعاً!`}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'emerald' | 'amber' | 'blue' | 'red';
    delay?: string;
    onClick?: () => void;
}

const StatCard = ({ title, value, icon, trend, trendValue, color = 'emerald', delay = '0s', onClick }: StatCardProps) => {
    const gradients = {
        emerald: 'from-emerald-500/20 to-emerald-500/5',
        amber: 'from-amber-500/20 to-amber-500/5',
        blue: 'from-blue-500/20 to-blue-500/5',
        red: 'from-red-500/20 to-red-500/5',
    };

    const borders = {
        emerald: 'border-emerald-500/20',
        amber: 'border-amber-500/20',
        blue: 'border-blue-500/20',
        red: 'border-red-500/20',
    };

    const textColors = {
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
        red: 'text-red-400',
    };

    return (
        <div
            onClick={onClick}
            className={`card bg-gradient-to-br ${gradients[color]} ${borders[color]} animate-slideUp ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            style={{ animationDelay: delay }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-(--text-secondary) font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold font-['Cairo'] tracking-tight">{value}</p>
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'} bg-black/20 w-fit px-2 py-1 rounded-full`}>
                            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/5 ${textColors[color]} shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// Alert Component
interface AlertProps {
    type: 'warning' | 'error' | 'success' | 'info';
    message: string;
}

const Alert = ({ type, message }: AlertProps) => {
    const styles = {
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    };

    const icons = {
        warning: <AlertCircle size={18} />,
        error: <AlertCircle size={18} />,
        success: <CheckCircle2 size={18} />,
        info: <AlertCircle size={18} />,
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${styles[type]} animate-slideInRight shadow-sm`}>
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

// Session Card Component
interface SessionCardProps {
    session: any;
}

const SessionCard = ({ session }: SessionCardProps) => {
    const statusColors: Record<string, string> = {
        'لم تبدأ': 'badge-warning',
        'بدأت': 'badge-info',
        'انتهت': 'badge-success',
    };

    return (
        <div className="card hover:border-[var(--accent-primary)] transition-all group cursor-pointer hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--accent-primary) group-hover:bg-(--accent-primary) group-hover:text-white transition-colors">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{session.halqa?.name || 'حلقة'}</h4>
                        <p className="text-sm text-(--text-secondary)">
                            {session.halqa?.classroom?.name || 'الفصل'}
                        </p>
                    </div>
                </div>
                <span className={`badge ${statusColors[session.status] || 'badge-info'}`}>
                    {session.status}
                </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-(--text-secondary) mb-4">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-(--text-muted)" />
                    <span>{session.totalStudents || 0} طالب</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-(--text-muted)" />
                    <span>{session.halqa?.startTime || '14:00'}</span>
                </div>
            </div>

            {session.attendanceStats && (
                <div className="pt-3 border-t border-(--border-color)">
                    <div className="w-full bg-(--bg-primary) rounded-full h-2 mb-2 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${(session.attendanceStats['حاضر'] / (session.totalStudents || 1)) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-emerald-400">حاضر: {session.attendanceStats['حاضر'] || 0}</span>
                        <span className="text-red-400">غائب: {session.attendanceStats['غائب'] || 0}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Friday Schedule Component
const FridaySchedule = ({ fridayInfo }: { fridayInfo: any }) => {
    if (!fridayInfo) return null;

    const schedules = [
        { time: 'بعد الفجر', activity: fridayInfo.afterFajr, icon: <Sunrise size={18} /> },
        { time: 'بعد الجمعة', activity: fridayInfo.afterJumaa, icon: <Sun size={18} /> },
        { time: 'بعد العصر', activity: fridayInfo.afterAsr, icon: <Sunset size={18} /> },
        { time: 'بعد المغرب', activity: fridayInfo.afterMaghrib, icon: <MoonIcon size={18} /> },
    ];

    return (
        <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Calendar size={20} />
                </div>
                جدول يوم الجمعة
            </h3>
            <div className="space-y-3 relative z-10">
                {schedules.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-(--bg-tertiary)/50 hover:bg-(--bg-tertiary) transition-colors border border-transparent hover:border-(--border-color)">
                        <div className="text-amber-400 p-2 bg-amber-400/10 rounded-lg">{item.icon}</div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-(--text-primary) mb-0.5">{item.time}</p>
                            <p className="text-xs text-(--text-secondary)">{item.activity}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Dashboard Page
const DashboardPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { data, financialSummary, isLoading, error } = useAppSelector((state) => state.dashboard);
    const { pendingStudents, scheduledInterviews } = useAppSelector((state) => state.onboarding);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchDashboard());

        if (user?.role === 'director' || user?.role === 'student_affairs') {
            dispatch(fetchPendingApplications());
        }

        if (user?.role === 'director') {
            const now = new Date();
            dispatch(fetchFinancialSummary({ year: now.getFullYear(), month: now.getMonth() + 1 }));
            dispatch(fetchScheduledInterviews());
        }
    }, [dispatch, user?.role]);

    const isDirector = user?.role === 'director';
    const isStudentAffairs = user?.role === 'student_affairs';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
                <div className="p-4 rounded-full bg-red-500/10 mb-4 text-red-400">
                    <AlertCircle size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">حدث خطأ</h3>
                <p className="text-(--text-secondary) mb-6">{error}</p>
                <button onClick={() => dispatch(fetchDashboard())} className="btn-primary">
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slideUp">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-gradient">لوحة اليوم</h1>
                    <p className="text-(--text-secondary) text-lg flex items-center gap-2">
                        <Calendar size={18} />
                        {data?.today?.dayName} - {data?.today?.date}
                    </p>
                </div>
                {data?.today?.isFriday && (
                    <div className="badge badge-warning py-2.5 px-5 text-sm shadow-lg shadow-amber-500/20 animate-pulse-soft">
                        يوم الجمعة - يوم تربوي
                    </div>
                )}
            </div>

            {/* Recreational Banner */}
            {data?.upcomingFriday?.isRecreational && (
                <RecreationalBanner
                    date={String(data.upcomingFriday.date)}
                    isToday={data.upcomingFriday.isToday}
                />
            )}

            {/* Alerts */}
            {data?.alerts && data.alerts.length > 0 && (
                <div className="space-y-3">
                    {data.alerts.map((alert: any, index: number) => (
                        <Alert key={index} type={alert.type as any} message={alert.message} />
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="إجمالي الطلاب"
                    value={data?.stats?.totalStudents || 0}
                    icon={<Users size={24} />}
                    color="emerald"
                    delay="0.1s"
                />
                <StatCard
                    title="الحلقات النشطة"
                    value={data?.stats?.totalHalqat || 0}
                    icon={<BookOpen size={24} />}
                    color="blue"
                    delay="0.2s"
                />

                {(isDirector || isStudentAffairs) && (
                    <StatCard
                        title="طلبات الالتحاق"
                        value={pendingStudents.length}
                        icon={<FileText size={24} />}
                        color="amber"
                        delay="0.3s"
                        onClick={() => navigate('/onboarding')}
                    />
                )}

                {isDirector && (
                    <StatCard
                        title="المقابلات المجدولة"
                        value={scheduledInterviews.length}
                        icon={<Calendar size={24} />}
                        color="blue"
                        delay="0.4s"
                        onClick={() => navigate('/interviews')}
                    />
                )}

                {(user?.role === 'teacher' || user?.role === 'supervisor') && (
                    <StatCard
                        title="جلسات اليوم"
                        value={data?.stats?.todaySessionsCount || 0}
                        icon={<Calendar size={24} />}
                        color="amber"
                        delay="0.3s"
                    />
                )}
            </div>

            {/* Financial Summary for Director */}
            {isDirector && financialSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    <StatCard
                        title="الدخل المحصل"
                        value={`${financialSummary.income.paid} ج`}
                        icon={<TrendingUp size={24} />}
                        color="emerald"
                    />
                    <StatCard
                        title="المصروفات"
                        value={`${financialSummary.expenses.total} ج`}
                        icon={<TrendingDown size={24} />}
                        color="red"
                    />
                    <StatCard
                        title="صافي الربح"
                        value={`${financialSummary.netProfit} ج`}
                        icon={<DollarSign size={24} />}
                        color={financialSummary.netProfit >= 0 ? 'emerald' : 'red'}
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.5s' }}>
                {/* Sessions List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Clock size={20} className="text-(--accent-primary)" />
                            جلسات اليوم
                        </h3>
                        <button onClick={() => navigate('/sessions')} className="text-sm text-(--accent-primary) hover:underline flex items-center gap-1">
                            عرض الكل <ArrowLeft size={14} />
                        </button>
                    </div>

                    {data?.sessions && data.sessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {data.sessions.map((session: any) => (
                                <SessionCard key={session._id} session={session} />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-12 border-dashed border-2 bg-transparent">
                            <div className="w-16 h-16 rounded-full bg-(--bg-tertiary) flex items-center justify-center mx-auto mb-4 text-(--text-muted)">
                                <Calendar size={32} />
                            </div>
                            <h4 className="text-lg font-bold mb-1">لا توجد جلسات اليوم</h4>
                            <p className="text-(--text-secondary)">لم يتم جدولة أي جلسات لهذا اليوم</p>
                        </div>
                    )}
                </div>

                {/* Friday Schedule or Quick Actions */}
                <div className="space-y-5">
                    {data?.today?.isFriday && data?.fridayInfo ? (
                        <FridaySchedule fridayInfo={data.fridayInfo} />
                    ) : (
                        <div className="card bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-(--accent-primary) rounded-full"></div>
                                إجراءات سريعة
                            </h3>
                            <div className="space-y-3">
                                <button onClick={() => navigate('/onboarding')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-(--bg-primary) hover:translate-x-[-4px] transition-transform border border-(--border-color) hover:border-[var(--accent-primary)] group">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <UserPlus size={20} />
                                    </div>
                                    <span className="font-bold text-sm">تسجيل طالب جديد</span>
                                    <ArrowLeft size={16} className="mr-auto text-(--text-muted) group-hover:text-(--text-primary)" />
                                </button>

                                <button onClick={() => navigate('/sessions')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-(--bg-primary) hover:translate-x-[-4px] transition-transform border border-(--border-color) hover:border-[var(--accent-primary)] group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <span className="font-bold text-sm">بدء جلسة جديدة</span>
                                    <ArrowLeft size={16} className="mr-auto text-(--text-muted) group-hover:text-(--text-primary)" />
                                </button>

                                {isDirector && (
                                    <>
                                        <button onClick={() => navigate('/financial')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-(--bg-primary) hover:translate-x-[-4px] transition-transform border border-(--border-color) hover:border-[var(--accent-primary)] group">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                                <DollarSign size={20} />
                                            </div>
                                            <span className="font-bold text-sm">تسجيل اشتراك</span>
                                            <ArrowLeft size={16} className="mr-auto text-(--text-muted) group-hover:text-(--text-primary)" />
                                        </button>

                                        <button onClick={() => navigate('/interviews')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-(--bg-primary) hover:translate-x-[-4px] transition-transform border border-(--border-color) hover:border-[var(--accent-primary)] group">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                                <Calendar size={20} />
                                            </div>
                                            <span className="font-bold text-sm">جدول المقابلات</span>
                                            <ArrowLeft size={16} className="mr-auto text-(--text-muted) group-hover:text-(--text-primary)" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Teacher's Halqa Info */}
                    {user?.role === 'teacher' && data?.halqa && (
                        <div className="card relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-(--accent-primary) opacity-5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
                            <h3 className="font-bold text-lg mb-4 relative z-10">حلقتي</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-(--bg-tertiary)/50">
                                    <span className="text-(--text-secondary) text-sm">اسم الحلقة</span>
                                    <span className="font-bold">{data.halqa.name}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-(--bg-tertiary)/50">
                                    <span className="text-(--text-secondary) text-sm">عدد الطلاب</span>
                                    <span className="font-bold text-(--accent-primary)">{data.stats?.totalStudents || 0} طالب</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-(--bg-tertiary)/50">
                                    <span className="text-(--text-secondary) text-sm">الفصل</span>
                                    <span className="font-bold">{(data.halqa.classroom as any)?.name || '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
