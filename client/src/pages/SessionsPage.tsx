import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSessions, updateSession, type SessionsState } from '../redux/slices/sessionsSlice';
import { Calendar, Clock, Users, Play, Loader2, BookOpen, ClipboardList, Coffee, Settings, Zap } from 'lucide-react';
import SessionTimeline from '../components/session/SessionTimeline';
import type { Session } from '../types';

interface SessionCardProps {
    session: Session;
    onStart: () => void;
    onEnd?: () => void;
    onManage: () => void;
}

const SessionCard = ({ session, onStart, onManage }: SessionCardProps) => {
    const statusColors: Record<string, string> = { 'لم تبدأ': 'badge-warning', 'بدأت': 'badge-info', 'انتهت': 'badge-success' };
    const halqa = typeof session.halqa === 'object' ? session.halqa : null;
    const classroom = halqa && typeof halqa.classroom === 'object' ? halqa.classroom : null;

    return (
        <div className="card hover:border-[var(--accent-primary)]/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-gold)]/20 group-hover:scale-105 transition-transform">
                        <BookOpen size={24} className="text-[var(--accent-gold)]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{halqa?.name || 'حلقة'}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{classroom?.name || '-'}</p>
                    </div>
                </div>
                <span className={`badge ${statusColors[session.status]}`}>{session.status}</span>
            </div>

            <div className="mb-4">
                <SessionTimeline
                    status={session.status}
                    startedAt={session.startedAt}
                    endedAt={session.endedAt}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={16} className="text-[var(--accent-primary)]" />
                    <span>{session.timeStart || halqa?.startTime || '14:00'} - {session.timeEnd || halqa?.endTime || '16:00'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Users size={16} className="text-[var(--accent-primary)]" />
                    <span>{session.totalStudents || 0} طالب</span>
                </div>
            </div>

            {session.attendanceStats && (
                <div className="flex gap-4 text-xs mb-4">
                    <div className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        حاضر: {session.attendanceStats['حاضر'] || 0}
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        غائب: {session.attendanceStats['غائب'] || 0}
                    </div>
                </div>
            )}

            <div className="flex gap-2 mt-auto">
                {session.status === 'لم تبدأ' ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(); }}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        <Play size={16} />
                        بدء الجلسة
                    </button>
                ) : (
                    <button
                        onClick={onManage}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                        <ClipboardList size={16} />
                        إدارة الجلسة
                    </button>
                )}
            </div>
        </div>
    );
};

const SessionsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { todaySessions, isLoading } = useAppSelector((state) => state.sessions as unknown as SessionsState);
    const { user } = useAppSelector((state) => state.auth);

    const [dateRange] = useState<{ start: Date, end: Date }>(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start: today, end: tomorrow };
    });

    useEffect(() => {
        dispatch(fetchSessions({
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString()
        }));
    }, [dispatch, dateRange]);

    const handleStart = (id: string) => {
        if (window.confirm('هل أنت متأكد من بدء الجلسة؟')) {
            dispatch(updateSession({ id, data: { status: 'بدأت', startedAt: new Date().toISOString() } }));
        }
    };


    const handleManage = (id: string) => {
        navigate(`/sessions/${id}/attendance`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">جلسات اليوم</h1>
                    <p className="text-[var(--text-secondary)]">إدارة جلسات الحفظ والتسميع والحضور</p>
                </div>
                <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-4 py-2 rounded-lg">
                    {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            {todaySessions.length > 0 ? (
                <div className="space-y-8">
                    {/* Today's Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-[var(--accent-primary)]"></span>
                            جلسات اليوم
                            <span className="text-sm font-normal text-[var(--text-secondary)] mr-2">
                                ({new Date().toLocaleDateString('ar-EG', { weekday: 'long' })})
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {todaySessions.filter(s => new Date(s.date).getDate() === new Date().getDate()).map(session => (
                                <SessionCard
                                    key={session._id}
                                    session={session}
                                    onStart={() => handleStart(session._id)}
                                    onManage={() => handleManage(session._id)}
                                />
                            ))}
                            {todaySessions.filter(s => new Date(s.date).getDate() === new Date().getDate()).length === 0 && (
                                <div className="col-span-full py-8 text-center text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-xl border border-dashed border-[var(--border-color)]">
                                    لا توجد جلسات اليوم
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tomorrow's Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-[var(--accent-gold)]"></span>
                            جلسات الغد
                            <span className="text-sm font-normal text-[var(--text-secondary)] mr-2">
                                ({new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('ar-EG', { weekday: 'long' })})
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {todaySessions.filter(s => new Date(s.date).getDate() !== new Date().getDate()).map(session => (
                                <SessionCard
                                    key={session._id}
                                    session={session}
                                    onStart={() => handleStart(session._id)}
                                    onManage={() => handleManage(session._id)}
                                />
                            ))}
                            {todaySessions.filter(s => new Date(s.date).getDate() !== new Date().getDate()).length === 0 && (
                                <div className="col-span-full py-8 text-center text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-xl border border-dashed border-[var(--border-color)]">
                                    لا توجد جلسات مجدولة للغد
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card text-center py-20 flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-(--border-color) bg-transparent">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-(--accent-primary) opacity-10 blur-xl rounded-full animate-pulse-slow"></div>
                        <div className="w-24 h-24 rounded-full bg-(--bg-tertiary) flex items-center justify-center relative z-10 border border-(--border-color)">
                            {new Date().getDay() === 5 ? (
                                <Coffee size={48} className="text-amber-500" />
                            ) : (
                                <Calendar size={48} className="text-(--text-muted)" />
                            )}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-(--text-primary)">
                        {new Date().getDay() === 5 ? 'اليوم يوم جمعة مبارك' : 'لا توجد جلسات مجدولة اليوم'}
                    </h3>

                    <p className="text-(--text-secondary) max-w-lg mx-auto text-lg leading-relaxed mb-8">
                        {new Date().getDay() === 5
                            ? 'عادة ما تكون أيام الجمعة مخصصة للراحة أو الأنشطة التربوية والترفيهية. '
                            : 'يبدو أنه لا توجد جلسات تعليمية في جدول اليوم. استمتع بوقتك أو قم بالتحضير للجلسات القادمة.'}
                    </p>

                    {user?.role === 'director' && (
                        <div className="flex flex-col sm:flex-row gap-4 animate-slideUp">
                            {new Date().getDay() === 5 ? (
                                <button onClick={() => navigate('/friday')} className="btn-primary flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                    <Settings size={18} />
                                    إدارة يوم الجمعة
                                </button>
                            ) : (
                                <button onClick={() => navigate('/friday')} className="btn-secondary flex items-center gap-2">
                                    <Zap size={18} />
                                    مراجعة الإعدادات
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SessionsPage;

