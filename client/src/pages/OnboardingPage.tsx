import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
    fetchPendingApplications,
    createApplication,
    markFormGiven,
    submitForm,
    scheduleInterview
} from '../redux/slices/onboardingSlice';
import { fetchHalqat } from '../redux/slices/halqatSlice';
import {
    UserPlus,
    FileText,
    Calendar,
    Check,
    X,
    Loader2,
    User
} from 'lucide-react';
import type { Student, ApplicationStatus } from '../types';

// Application Status Badge
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
        New: { label: 'جديد', className: 'badge-info' },
        FormGiven: { label: 'تم تسليم الاستمارة', className: 'badge-warning' },
        FormSubmitted: { label: 'تم تقديم الاستمارة', className: 'badge-info' },
        InterviewScheduled: { label: 'مقابلة مجدولة', className: 'badge-warning' },
        InterviewCompleted: { label: 'تمت المقابلة', className: 'badge-info' },
        Accepted: { label: 'مقبول', className: 'badge-success' },
        Rejected: { label: 'مرفوض', className: 'badge-danger' },
        Pending: { label: 'قائمة انتظار', className: 'badge-warning' },
    };

    const config = statusConfig[status] || { label: status, className: 'badge-info' };

    return <span className={`badge ${config.className}`}>{config.label}</span>;
};

// New Application Form Modal
interface NewApplicationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

const NewApplicationForm = ({ isOpen, onClose, onSubmit, isLoading }: NewApplicationFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        stage: 'ابتدائي',
        guardian: {
            name: '',
            phone: '',
            alternatePhone: '',
            relationship: 'أب',
            whatsAppEnabled: true
        },
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-(--bg-card) rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-(--border-color)">
                    <h2 className="text-xl font-bold">تسجيل طالب جديد</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Student Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">اسم الطالب *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field w-full"
                            required
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium mb-2">المرحلة الدراسية *</label>
                        <select
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="ابتدائي">ابتدائي</option>
                            <option value="إعدادي">إعدادي</option>
                            <option value="ثانوي">ثانوي</option>
                            <option value="جامعة">جامعة</option>
                        </select>
                    </div>

                    <hr className="border-(--border-color)" />

                    {/* Guardian Info */}
                    <h3 className="font-bold">بيانات ولي الأمر</h3>

                    <div>
                        <label className="block text-sm font-medium mb-2">اسم ولي الأمر *</label>
                        <input
                            type="text"
                            value={formData.guardian.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, name: e.target.value }
                            })}
                            className="input-field w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                        <input
                            type="tel"
                            value={formData.guardian.phone}
                            onChange={(e) => setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, phone: e.target.value }
                            })}
                            className="input-field w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">صلة القرابة</label>
                        <select
                            value={formData.guardian.relationship}
                            onChange={(e) => setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, relationship: e.target.value }
                            })}
                            className="input-field w-full"
                        >
                            <option value="أب">أب</option>
                            <option value="أم">أم</option>
                            <option value="أخ">أخ</option>
                            <option value="عم">عم</option>
                            <option value="خال">خال</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="whatsapp"
                            checked={formData.guardian.whatsAppEnabled}
                            onChange={(e) => setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, whatsAppEnabled: e.target.checked }
                            })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="whatsapp" className="text-sm">تفعيل التواصل عبر واتساب</label>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ملاحظات</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field w-full"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                            تسجيل
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Application Card
interface ApplicationCardProps {
    student: Student;
    onAction: (action: string, student: Student) => void;
}

const ApplicationCard = ({ student, onAction }: ApplicationCardProps) => {
    const guardian = typeof student.guardian === 'object' ? student.guardian : null;

    const getAvailableActions = (status: ApplicationStatus) => {
        switch (status) {
            case 'New':
                return [{ action: 'formGiven', label: 'تسليم الاستمارة', icon: FileText }];
            case 'FormGiven':
                return [{ action: 'formSubmitted', label: 'تقديم الاستمارة', icon: Check }];
            case 'FormSubmitted':
                return [{ action: 'scheduleInterview', label: 'جدولة المقابلة', icon: Calendar }];
            default:
                return [];
        }
    };

    const actions = getAvailableActions(student.applicationStatus || 'New');

    return (
        <div className="card hover:border-(--accent-primary)/30 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--accent-primary) text-lg font-bold">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm text-(--text-secondary)">{student.stage}</p>
                    </div>
                </div>
                <StatusBadge status={student.applicationStatus || 'New'} />
            </div>

            {guardian && (
                <div className="text-sm text-(--text-secondary) mb-4 p-3 rounded-lg bg-(--bg-tertiary)">
                    <div className="flex items-center gap-2 mb-1">
                        <User size={14} />
                        <span>ولي الأمر: {guardian.name}</span>
                    </div>
                    <div className="text-(--text-muted)">
                        {guardian.phone}
                    </div>
                </div>
            )}

            {student.interviewDate && (
                <div className="flex items-center gap-2 text-sm text-amber-400 mb-4">
                    <Calendar size={14} />
                    <span>المقابلة: {new Date(student.interviewDate).toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
            )}

            {actions.length > 0 && (
                <div className="flex gap-2">
                    {actions.map(({ action, label, icon: Icon }) => (
                        <button
                            key={action}
                            onClick={() => onAction(action, student)}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Page
const OnboardingPage = () => {
    const dispatch = useAppDispatch();
    const { pendingStudents, isLoading } = useAppSelector(state => state.onboarding);
    const { user } = useAppSelector(state => state.auth);
    const [showNewForm, setShowNewForm] = useState(false);
    const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

    useEffect(() => {
        dispatch(fetchPendingApplications());
        dispatch(fetchHalqat());
    }, [dispatch]);

    const handleCreateApplication = async (data: any) => {
        const result = await dispatch(createApplication(data));
        if (createApplication.fulfilled.match(result)) {
            setShowNewForm(false);
        }
    };

    const handleAction = async (action: string, student: Student) => {
        switch (action) {
            case 'formGiven':
                dispatch(markFormGiven(student._id));
                break;
            case 'formSubmitted':
                // For now, just update status. In real app, would open a form to collect more data
                dispatch(submitForm({ studentId: student._id, data: {} }));
                break;
            case 'scheduleInterview':
                const result = await dispatch(scheduleInterview(student._id));
                if (scheduleInterview.fulfilled.match(result)) {
                    alert(`تم جدولة المقابلة يوم ${result.payload.interview.dayOfWeek} بعد صلاة العصر`);
                }
                break;
        }
    };

    const filteredStudents = filter === 'all'
        ? pendingStudents
        : pendingStudents.filter(s => s.applicationStatus === filter);

    const canManageOnboarding = user?.role === 'student_affairs' || user?.role === 'director';

    if (!canManageOnboarding) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <X size={64} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
                <p className="text-(--text-secondary)">لا تملك صلاحية الوصول لهذه الصفحة</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">تسجيل الطلاب الجدد</h1>
                    <p className="text-(--text-secondary)">إدارة طلبات الالتحاق والمقابلات</p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    طالب جديد
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { value: 'all', label: 'الكل' },
                    { value: 'New', label: 'جديد' },
                    { value: 'FormGiven', label: 'تم تسليم الاستمارة' },
                    { value: 'FormSubmitted', label: 'تم التقديم' },
                    { value: 'InterviewScheduled', label: 'مقابلة مجدولة' },
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === value
                            ? 'bg-(--accent-primary) text-white'
                            : 'bg-(--bg-tertiary) text-(--text-secondary) hover:bg-(--bg-card)'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Students Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-(--accent-primary)" />
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(student => (
                        <ApplicationCard
                            key={student._id}
                            student={student}
                            onAction={handleAction}
                        />
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <UserPlus size={64} className="mx-auto text-(--text-muted) mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
                    <p className="text-(--text-secondary)">
                        {filter === 'all' ? 'لا توجد طلبات التحاق حالياً' : 'لا توجد طلبات في هذه الحالة'}
                    </p>
                </div>
            )}

            {/* New Application Modal */}
            <NewApplicationForm
                isOpen={showNewForm}
                onClose={() => setShowNewForm(false)}
                onSubmit={handleCreateApplication}
                isLoading={isLoading}
            />
        </div>
    );
};

export default OnboardingPage;
