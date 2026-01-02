import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
    fetchFridayConfig,
    setRecreationalDay,
    generateFridaySessions,
    clearError
} from '../redux/slices/fridaySlice';
import {
    Calendar,
    Sun,
    Users,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Settings,
    Play
} from 'lucide-react';

const FridayManagementPage = () => {
    const dispatch = useAppDispatch();
    const { config, isLoading, error } = useAppSelector((state) => state.friday);
    const { user } = useAppSelector((state) => state.auth);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        dispatch(fetchFridayConfig());
        return () => { dispatch(clearError()); };
    }, [dispatch]);

    const handleToggleRecreational = async () => {
        if (!config) return;

        const newValue = !config.isRecreationalDay;
        const confirmMessage = newValue
            ? 'هل أنت متأكد من تفعيل اليوم الترفيهي؟ (سيتم إضافته بجانب الجدول التعليمي)'
            : 'هل أنت متأكد من إلغاء اليوم الترفيهي؟';

        if (window.confirm(confirmMessage)) {
            setUpdating(true);
            try {
                await dispatch(setRecreationalDay(newValue)).unwrap();
                // Updated successfully
            } catch (err) {
                // Error handled by slice
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleGenerateSessions = async () => {
        if (window.confirm('هل أنت متأكد من إنشاء جلسات الجمعة؟')) {
            setUpdating(true);
            try {
                await dispatch(generateFridaySessions()).unwrap();
                alert('تم إنشاء الجلسات بنجاح');
            } catch (err) {
                // Error handled by slice
            } finally {
                setUpdating(false);
            }
        }
    };

    if (isLoading && !config) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    // Role check - though typical protection is at route level
    if (user?.role !== 'director') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold">غير مصرح لك بالوصول</h2>
                <p className="text-[var(--text-secondary)]">هذه الصفحة مخصصة للمدير فقط.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="text-[var(--accent-primary)]" />
                    إدارة يوم الجمعة
                </h1>
                <p className="text-[var(--text-secondary)]">التحكم في إعدادات يوم الجمعة والجداول</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Card */}
                <div className="card">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-[var(--text-muted)]" />
                        الإعدادات الرئيسية
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]/50 border border-transparent transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${config?.isRecreationalDay ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    <Sun size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">
                                        {config?.isRecreationalDay ? 'يوم ترفيهي' : 'يوم تعليمي'}
                                    </h4>
                                    <p className="text-sm text-[var(--text-secondary)]">حالة يوم الجمعة الحالي</p>
                                </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config?.isRecreationalDay || false}
                                    onChange={handleToggleRecreational}
                                    disabled={updating || !config?.canModify}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                            </label>
                        </div>


                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Users size={18} />
                                    الجلسات التعليمية
                                </h4>
                                <span className="text-sm text-[var(--text-secondary)]">عدد الجلسات: {config?.sessions || 0}</span>
                            </div>

                            <button
                                onClick={handleGenerateSessions}
                                disabled={updating}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {updating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                توليد الجلسات يدوياً
                            </button>
                            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                                يتم توليد الجلسات تلقائياً، استخدم هذا الزر فقط عند الحاجة للتحديث اليدوي.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Info Card */}
                <div className="card bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        معلومات هامة
                    </h3>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2" />
                            <p className="text-sm text-[var(--text-secondary)]">
                                في <span className="text-[var(--text-primary)] font-bold">اليوم الترفيهي</span>، يتم تفعيل الأنشطة الترفيهية بجانب الجلسات التعليمية وتظهر علامة مميزة في لوحة التحكم.
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2" />
                            <p className="text-sm text-[var(--text-secondary)]">
                                في <span className="text-[var(--text-primary)] font-bold">اليوم التعليمي</span>، يتم جدولة الجلسات بناءً على المراحل التعليمية (تمهيدي، ابتدائي، متوسط، ثانوي).
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2" />
                            <p className="text-sm text-[var(--text-secondary)]">
                                يمكنك تغيير الحالة في أي وقت قبل نهاية يوم الجمعة. سيتم إخطار المعلمين بالتغييرات تلقائياً عبر لوحة التحكم الخاصة بهم.
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FridayManagementPage;
