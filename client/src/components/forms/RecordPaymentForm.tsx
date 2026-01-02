import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createSubscription } from '../../redux/slices/financialSlice';
import { fetchStudents } from '../../redux/slices/studentsSlice';
import { Loader2, Search, User, Save, X } from 'lucide-react';
import type { Student } from '../../types';

interface RecordPaymentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const MONTHS = [
    { value: 1, label: 'يناير' }, { value: 2, label: 'فبراير' }, { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' }, { value: 5, label: 'مايو' }, { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' }, { value: 8, label: 'أغسطس' }, { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' }, { value: 11, label: 'نوفمبر' }, { value: 12, label: 'ديسمبر' }
];

const RecordPaymentForm = ({ onSuccess, onCancel }: RecordPaymentFormProps) => {
    const dispatch = useAppDispatch();
    const { students, isLoading: isLoadingStudents } = useAppSelector((state) => state.students);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [formData, setFormData] = useState({
        monthNumber: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 100,
        status: 'مدفوع', // matched with backend/types
        paidAmount: 100,
        notes: ''
    });

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit results

    const getHalqaName = (halqa: any) => {
        if (!halqa) return 'بدون حلقة';
        if (typeof halqa === 'string') return 'بدون حلقة';
        return halqa.name;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsLoading(true);

        try {
            await dispatch(createSubscription({
                ...formData,
                month: MONTHS.find(m => m.value === formData.monthNumber)?.label || '',
                student: selectedStudent._id
            })).unwrap();
            onSuccess();
        } catch (error) {
            console.error('Error recording payment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Student Search Section */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full"></span>
                    بيانات الطالب
                </div>

                <div className="input-group">
                    <label className="input-label">بحث عن طالب</label>
                    {!selectedStudent ? (
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                                placeholder="ابحث عن اسم الطالب..."
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={20} />

                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                    {isLoadingStudents ? (
                                        <div className="p-4 text-center text-[var(--text-secondary)]">
                                            <Loader2 className="animate-spin mx-auto mb-2" />
                                            جاري البحث...
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <button
                                                key={student._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setSearchTerm('');
                                                }}
                                                className="w-full text-right p-3 hover:bg-[var(--bg-card)] border-b border-[var(--border-color)] last:border-0 transition-colors flex items-center justify-between group"
                                            >
                                                <span className="font-medium group-hover:text-[var(--accent-primary)] transition-colors">{student.name}</span>
                                                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] px-2 py-1 rounded-full">
                                                    {getHalqaName(student.halqa)}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-[var(--text-muted)]">
                                            لا توجد نتائج
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)]">{selectedStudent.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{getHalqaName(selectedStudent.halqa)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedStudent(null)}
                                className="text-[var(--text-muted)] hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Details */}
            <div className={`form-section transition-all duration-300 ${!selectedStudent ? 'opacity-50 pointer-events-none blur-[1px]' : ''}`}>
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
                    تفاصيل الاشتراك
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                        <label className="input-label">الشهر</label>
                        <select
                            value={formData.monthNumber}
                            onChange={(e) => setFormData({ ...formData, monthNumber: Number(e.target.value) })}
                            className="input-field"
                        >
                            {MONTHS.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">العام</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="input-group">
                        <label className="input-label">المبلغ المستحق</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            className="input-field font-bold"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">المبلغ المدفوع</label>
                        <input
                            type="number"
                            value={formData.paidAmount}
                            onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                            className="input-field font-bold text-[var(--accent-primary)]"
                            min="0"
                        />
                    </div>
                </div>

                <div className="input-group mt-4">
                    <label className="input-label">الحالة</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="input-field"
                    >
                        <option value="مدفوع">مدفوع</option>
                        <option value="جزئي">جزئي</option>
                        <option value="متأخر">متأخر</option>
                        <option value="معفي">معفي</option>
                    </select>
                </div>

                <div className="input-group mt-4">
                    <label className="input-label">ملاحظات</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="input-field min-h-[80px]"
                        placeholder="أضف ملاحظات (اختياري)..."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                    type="submit"
                    disabled={isLoading || !selectedStudent}
                    className="btn-primary flex-1 py-3"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    تسجيل الدخل
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="btn-secondary flex-1 py-3"
                >
                    <X size={20} />
                    إلغاء
                </button>
            </div>
        </form>
    );
};

export default RecordPaymentForm;
