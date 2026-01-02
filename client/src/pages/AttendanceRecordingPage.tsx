import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSession, saveAttendance } from '../redux/slices/sessionsSlice';
import {
    Users,
    Check,
    CheckCheck,
    Save,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import type { AttendanceStatus, Student } from '../types';
import { API_BASE_URL } from '../api/config';
import SessionTimeline from '../components/session/SessionTimeline';
import AttendanceStudentRow from '../components/attendance/AttendanceStudentRow';

interface AttendanceRecord {
    student: string;
    status: AttendanceStatus;
    absenceReason?: string;
}

const AttendanceRecordingPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentSession, isLoading } = useAppSelector(state => state.sessions);
    const { user } = useAppSelector(state => state.auth);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        if (sessionId) {
            dispatch(fetchSession(sessionId));
        }
    }, [dispatch, sessionId]);

    // Initialize attendance from session data
    useEffect(() => {
        if (currentSession?.students) {
            const initialAttendance: Record<string, AttendanceRecord> = {};
            currentSession.students.forEach((student: any) => {
                if (student.attendance) {
                    initialAttendance[student._id] = {
                        student: student._id,
                        status: student.attendance,
                    };
                }
            });
            setAttendance(initialAttendance);
        }
    }, [currentSession]);

    const handleStatusChange = useCallback((studentId: string, status: AttendanceStatus, absenceReason?: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { student: studentId, status, absenceReason }
        }));
        setHasChanges(true);
    }, []);

    const handleMarkAllPresent = () => {
        if (!currentSession?.students) return;

        const allPresent: Record<string, AttendanceRecord> = {};
        currentSession.students.forEach((student: any) => {
            allPresent[student._id] = {
                student: student._id,
                status: 'حاضر'
            };
        });
        setAttendance(allPresent);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!sessionId || Object.keys(attendance).length === 0) return;

        setIsSaving(true);
        try {
            const attendanceArray = Object.values(attendance);
            await dispatch(saveAttendance({ sessionId, attendance: attendanceArray }));
            setHasChanges(false);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving attendance:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save every 30 seconds if there are changes
    useEffect(() => {
        if (!hasChanges) return;

        const autoSaveTimer = setTimeout(() => {
            handleSave();
        }, 30000);

        return () => clearTimeout(autoSaveTimer);
    }, [hasChanges, attendance]);

    const handleContactParent = (student: Student) => {
        // Open WhatsApp for the student's guardian
        window.open(`${API_BASE_URL}/api/communication/whatsapp-link/${student._id}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    if (!currentSession) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle size={64} className="text-amber-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">الجلسة غير موجودة</h2>
                <p className="text-[var(--text-secondary)]">لم يتم العثور على الجلسة المطلوبة</p>
                <button onClick={() => navigate('/sessions')} className="btn-primary mt-4">
                    العودة للجلسات
                </button>
            </div>
        );
    }

    const halqa = typeof currentSession.halqa === 'object' ? currentSession.halqa : null;
    const students = currentSession.students || [];
    const presentCount = Object.values(attendance).filter(a => a.status === 'حاضر').length;
    const absentCount = Object.values(attendance).filter(a => a.status === 'غائب').length;

    const canContact = user?.role === 'student_affairs' || user?.role === 'director';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/sessions')}
                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">تسجيل الحضور</h1>
                    <p className="text-[var(--text-secondary)]">
                        {halqa?.name || 'الحلقة'} - {new Date(currentSession.date).toLocaleDateString('ar-EG')}
                    </p>
                </div>
            </div>

            {/* Session Timeline */}
            <div className="card">
                <SessionTimeline
                    status={currentSession.status}
                    startedAt={currentSession.startedAt}
                    endedAt={currentSession.endedAt}
                />
            </div>

            {/* Stats Bar */}
            <div className="flex gap-4 flex-wrap">
                <div className="card flex-1 min-w-[120px] bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <Users size={24} className="text-blue-400" />
                        <div>
                            <div className="text-2xl font-bold">{students.length}</div>
                            <div className="text-xs text-[var(--text-secondary)]">إجمالي الطلاب</div>
                        </div>
                    </div>
                </div>
                <div className="card flex-1 min-w-[120px] bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <div className="flex items-center gap-3">
                        <Check size={24} className="text-emerald-400" />
                        <div>
                            <div className="text-2xl font-bold">{presentCount}</div>
                            <div className="text-xs text-[var(--text-secondary)]">حاضر</div>
                        </div>
                    </div>
                </div>
                <div className="card flex-1 min-w-[120px] bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} className="text-red-400" />
                        <div>
                            <div className="text-2xl font-bold">{absentCount}</div>
                            <div className="text-xs text-[var(--text-secondary)]">غائب</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleMarkAllPresent}
                    className="btn-secondary flex items-center gap-2"
                >
                    <CheckCheck size={18} />
                    تحديد الكل حاضر
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="btn-primary flex items-center gap-2"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    حفظ الحضور
                </button>
                {lastSaved && (
                    <span className="text-sm text-[var(--text-muted)] self-center">
                        آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG')}
                    </span>
                )}
                {hasChanges && (
                    <span className="text-sm text-amber-400 self-center animate-pulse">
                        توجد تغييرات غير محفوظة
                    </span>
                )}
            </div>

            {/* Students List */}
            <div className="space-y-3">
                {students.length > 0 ? (
                    students.map((student: any) => (
                        <AttendanceStudentRow
                            key={student._id}
                            student={student}
                            attendance={attendance[student._id] as any}
                            onStatusChange={handleStatusChange}
                            onContactParent={canContact ? handleContactParent : undefined}
                            showContactButton={canContact}
                        />
                    ))
                ) : (
                    <div className="card text-center py-12">
                        <Users size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">لا يوجد طلاب</h3>
                        <p className="text-[var(--text-secondary)]">لم يتم تسجيل أي طلاب في هذه الحلقة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceRecordingPage;
