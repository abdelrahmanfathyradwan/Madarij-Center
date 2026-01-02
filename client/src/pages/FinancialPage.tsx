import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchFinancialSummary } from '../redux/slices/dashboardSlice';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Loader2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Receipt,
    CreditCard
} from 'lucide-react';
import Modal from '../components/common/Modal';
import RecordExpenseForm from '../components/forms/RecordExpenseForm';
import RecordPaymentForm from '../components/forms/RecordPaymentForm';

const MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const StatCard = ({ title, value, icon, trend, color = 'emerald' }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    color?: 'emerald' | 'red' | 'blue' | 'amber';
}) => {
    const colors = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    };

    return (
        <div className={`card bg-gradient-to-br ${colors[color]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-card)]">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className={`mt-3 flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{trend === 'up' ? 'زيادة' : 'نقص'}</span>
                </div>
            )}
        </div>
    );
};

const FinancialPage = () => {
    const dispatch = useAppDispatch();
    const { financialSummary, isLoading } = useAppSelector((state) => state.dashboard);
    const { user } = useAppSelector((state) => state.auth);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    useEffect(() => {
        if (user?.role === 'director') {
            dispatch(fetchFinancialSummary({ year: currentYear, month: currentMonth }));
        }
    }, [dispatch, currentYear, currentMonth, user?.role]);

    const goToPreviousMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const handleExpenseRecorded = () => {
        setIsExpenseModalOpen(false);
        dispatch(fetchFinancialSummary({ year: currentYear, month: currentMonth }));
    };

    const handleIncomeRecorded = () => {
        setIsIncomeModalOpen(false);
        dispatch(fetchFinancialSummary({ year: currentYear, month: currentMonth }));
    };

    if (user?.role !== 'director') {
        return (
            <div className="card text-center py-12">
                <DollarSign size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-bold mb-2">غير مصرح</h3>
                <p className="text-[var(--text-secondary)]">
                    هذه الصفحة متاحة للمدير فقط
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الإدارة المالية</h1>
                    <p className="text-[var(--text-secondary)]">متابعة الدخل والمصروفات</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsIncomeModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        تسجيل دخل
                    </button>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        تسجيل مصروف
                    </button>
                </div>
            </div>

            {/* Month Selector */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-[var(--accent-gold)]" />
                        <span className="text-lg font-bold">
                            {MONTHS[currentMonth - 1]} {currentYear}
                        </span>
                    </div>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>

            {/* Financial Stats */}
            {financialSummary ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <StatCard
                            title="الدخل المحصل"
                            value={`${financialSummary.income.paid} ج.م`}
                            icon={<TrendingUp size={24} />}
                            color="emerald"
                        />
                        <StatCard
                            title="المصروفات"
                            value={`${financialSummary.expenses.total} ج.م`}
                            icon={<TrendingDown size={24} />}
                            color="red"
                        />
                        <StatCard
                            title="صافي الربح"
                            value={`${financialSummary.netProfit} ج.م`}
                            icon={<DollarSign size={24} />}
                            color={financialSummary.netProfit >= 0 ? 'emerald' : 'red'}
                        />
                    </div>

                    {/* Income Details */}
                    <div className="card">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-emerald-400" />
                            تفاصيل الدخل
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)] mb-1">الدخل المتوقع</p>
                                <p className="text-2xl font-bold text-blue-400">{financialSummary.income.expected} ج.م</p>
                            </div>
                            <div className="p-4 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)] mb-1">المحصل</p>
                                <p className="text-2xl font-bold text-emerald-400">{financialSummary.income.paid} ج.م</p>
                            </div>
                            <div className="p-4 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)] mb-1">المتبقي</p>
                                <p className="text-2xl font-bold text-amber-400">{financialSummary.income.pending} ج.م</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions Summary */}
                    <div className="card">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Receipt size={20} className="text-blue-400" />
                            ملخص الاشتراكات
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)]">مدفوعة</p>
                                <p className="text-xl font-bold text-emerald-400">{financialSummary.subscriptions.paid}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)]">متأخرة</p>
                                <p className="text-xl font-bold text-amber-400">{financialSummary.subscriptions.pending}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)]">معفاة</p>
                                <p className="text-xl font-bold text-blue-400">{financialSummary.subscriptions.exempt}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg-card)]">
                                <p className="text-sm text-[var(--text-secondary)]">الإجمالي</p>
                                <p className="text-xl font-bold">{financialSummary.subscriptions.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Breakdown */}
                    {financialSummary.expenses.breakdown.length > 0 && (
                        <div className="card">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Receipt size={20} className="text-red-400" />
                                تفاصيل المصروفات
                            </h3>
                            <div className="space-y-3">
                                {financialSummary.expenses.breakdown.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-card)]">
                                        <span className="font-medium">{item._id}</span>
                                        <span className="text-red-400 font-bold">{item.total} ج.م</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="card text-center py-12">
                    <DollarSign size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا توجد بيانات مالية</h3>
                    <p className="text-[var(--text-secondary)]">لا توجد بيانات مالية لهذا الشهر</p>
                </div>
            )}

            {/* Record Expense Modal */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                title="تسجيل مصروف جديد"
            >
                <RecordExpenseForm
                    onSuccess={handleExpenseRecorded}
                    onCancel={() => setIsExpenseModalOpen(false)}
                />
            </Modal>

            {/* Record Income Modal */}
            <Modal
                isOpen={isIncomeModalOpen}
                onClose={() => setIsIncomeModalOpen(false)}
                title="تسجيل دخل جديد"
            >
                <RecordPaymentForm
                    onSuccess={handleIncomeRecorded}
                    onCancel={() => setIsIncomeModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default FinancialPage;
