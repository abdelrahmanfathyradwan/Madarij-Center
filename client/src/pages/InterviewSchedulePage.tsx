import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchScheduledInterviews, setInterviewResult } from '../redux/slices/onboardingSlice';
import { fetchHalqat } from '../redux/slices/halqatSlice';
import {
    Calendar,
    Clock,
    User,
    Check,
    X,
    Loader2,
    CheckCircle,
    XCircle,
    HelpCircle
} from 'lucide-react';
import type { Interview, Halqa } from '../types';

// Interview Result Modal
interface ResultModalProps {
    isOpen: boolean;
    interview: Interview | null;
    halqat: Halqa[];
    onClose: () => void;
    onSubmit: (result: string, notes: string, halqa?: string) => void;
    isLoading: boolean;
}

const ResultModal = ({ isOpen, interview, halqat, onClose, onSubmit, isLoading }: ResultModalProps) => {
    const [result, setResult] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [selectedHalqa, setSelectedHalqa] = useState('');

    if (!isOpen || !interview) return null;

    const student = typeof interview.student === 'object' ? interview.student : null;

    const handleSubmit = () => {
        if (!result) return;
        onSubmit(result, notes, result === 'accepted' ? selectedHalqa : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-md">
                <div className="p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">نتيجة المقابلة</h2>
                    {student && (
                        <p className="text-[var(--text-secondary)] mt-1">الطالب: {student.name}</p>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    {/* Result Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setResult('accepted')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${result === 'accepted'
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-[var(--border-color)] hover:border-emerald-500/50'
                                }`}
                        >
                            <CheckCircle size={32} className={result === 'accepted' ? 'text-emerald-500' : 'text-[var(--text-muted)]'} />
                            <span className={`font-medium ${result === 'accepted' ? 'text-emerald-500' : ''}`}>قبول</span>
                        </button>
                        <button
                            onClick={() => setResult('rejected')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${result === 'rejected'
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-[var(--border-color)] hover:border-red-500/50'
                                }`}
                        >
                            <XCircle size={32} className={result === 'rejected' ? 'text-red-500' : 'text-[var(--text-muted)]'} />
                            <span className={`font-medium ${result === 'rejected' ? 'text-red-500' : ''}`}>رفض</span>
                        </button>
                        <button
                            onClick={() => setResult('pending')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${result === 'pending'
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-[var(--border-color)] hover:border-amber-500/50'
                                }`}
                        >
                            <HelpCircle size={32} className={result === 'pending' ? 'text-amber-500' : 'text-[var(--text-muted)]'} />
                            <span className={`font-medium ${result === 'pending' ? 'text-amber-500' : ''}`}>انتظار</span>
                        </button>
                    </div>

                    {/* Halqa Selection (for accepted students) */}
                    {result === 'accepted' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">اختر الحلقة</label>
                            <select
                                value={selectedHalqa}
                                onChange={(e) => setSelectedHalqa(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">-- اختر الحلقة --</option>
                                {halqat.map(halqa => (
                                    <option key={halqa._id} value={halqa._id}>
                                        {halqa.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ملاحظات</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field w-full"
                            rows={3}
                            placeholder="أضف ملاحظات عن المقابلة..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!result || isLoading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            تأكيد
                        </button>
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Interview Card
interface InterviewCardProps {
    interview: Interview;
    onSetResult: (interview: Interview) => void;
}

const InterviewCard = ({ interview, onSetResult }: InterviewCardProps) => {
    const student = typeof interview.student === 'object' ? interview.student : null;
    const scheduledBy = typeof interview.scheduledBy === 'object' ? interview.scheduledBy : null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isToday = () => {
        const today = new Date();
        const interviewDate = new Date(interview.scheduledDate);
        return today.toDateString() === interviewDate.toDateString();
    };

    return (
        <div className={`card ${isToday() ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
            {isToday() && (
                <div className="badge badge-warning mb-3">اليوم</div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-primary)] text-lg font-bold">
                        {student?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{student?.name || 'طالب'}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{student?.stage}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Calendar size={14} />
                    <span>{formatDate(interview.scheduledDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={14} />
                    <span>{interview.dayOfWeek} - {interview.timeSlot}</span>
                </div>
                {scheduledBy && (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <User size={14} />
                        <span>جُدولت بواسطة: {scheduledBy.name}</span>
                    </div>
                )}
            </div>

            <button
                onClick={() => onSetResult(interview)}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <Check size={18} />
                تسجيل النتيجة
            </button>
        </div>
    );
};

// Main Page
const InterviewSchedulePage = () => {
    const dispatch = useAppDispatch();
    const { scheduledInterviews, isLoading } = useAppSelector(state => state.onboarding);
    const { halqat } = useAppSelector(state => state.halqat);
    const { user } = useAppSelector(state => state.auth);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);

    useEffect(() => {
        dispatch(fetchScheduledInterviews());
        dispatch(fetchHalqat());
    }, [dispatch]);

    const handleSetResult = (interview: Interview) => {
        setSelectedInterview(interview);
        setShowResultModal(true);
    };

    const handleSubmitResult = async (result: string, notes: string, halqa?: string) => {
        if (!selectedInterview) return;

        const student = typeof selectedInterview.student === 'object' ? selectedInterview.student : null;
        if (!student) return;

        const action = await dispatch(setInterviewResult({
            studentId: student._id,
            result,
            notes,
            halqa
        }));

        if (setInterviewResult.fulfilled.match(action)) {
            setShowResultModal(false);
            setSelectedInterview(null);
            dispatch(fetchScheduledInterviews()); // Refresh list
        }
    };

    const isDirector = user?.role === 'director';

    if (!isDirector) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <X size={64} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
                <p className="text-[var(--text-secondary)]">هذه الصفحة متاحة للمدير فقط</p>
            </div>
        );
    }

    // Group interviews by date
    const groupedInterviews = scheduledInterviews.reduce((groups, interview) => {
        const date = new Date(interview.scheduledDate).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(interview);
        return groups;
    }, {} as Record<string, Interview[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">جدول المقابلات</h1>
                <p className="text-[var(--text-secondary)]">إدارة مقابلات الطلاب الجدد</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
                <div className="card flex-1 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <div className="text-3xl font-bold text-amber-400">{scheduledInterviews.length}</div>
                    <div className="text-sm text-[var(--text-secondary)]">مقابلات مجدولة</div>
                </div>
                <div className="card flex-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <div className="text-3xl font-bold text-blue-400">
                        {scheduledInterviews.filter(i => {
                            const today = new Date().toDateString();
                            return new Date(i.scheduledDate).toDateString() === today;
                        }).length}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">مقابلات اليوم</div>
                </div>
            </div>

            {/* Interviews List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
                </div>
            ) : scheduledInterviews.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedInterviews).map(([date, interviews]) => (
                        <div key={date}>
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Calendar size={18} className="text-[var(--accent-primary)]" />
                                {new Date(date).toLocaleDateString('ar-EG', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {interviews.map(interview => (
                                    <InterviewCard
                                        key={interview._id}
                                        interview={interview}
                                        onSetResult={handleSetResult}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <Calendar size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا توجد مقابلات مجدولة</h3>
                    <p className="text-[var(--text-secondary)]">سيتم عرض المقابلات هنا عند جدولتها</p>
                </div>
            )}

            {/* Result Modal */}
            <ResultModal
                isOpen={showResultModal}
                interview={selectedInterview}
                halqat={halqat}
                onClose={() => {
                    setShowResultModal(false);
                    setSelectedInterview(null);
                }}
                onSubmit={handleSubmitResult}
                isLoading={isLoading}
            />
        </div>
    );
};

export default InterviewSchedulePage;
