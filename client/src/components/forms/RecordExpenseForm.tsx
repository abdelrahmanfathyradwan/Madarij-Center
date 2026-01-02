import { useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../../redux/hooks';
import type { ExpenseType } from '../../types';
import { Loader2 } from 'lucide-react';

interface RecordExpenseFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const EXPENSE_TYPES: ExpenseType[] = ['إيجار', 'معلمين', 'كهرباء', 'مياه', 'صيانة', 'مستلزمات', 'أخرى'];

const RecordExpenseForm = ({ onSuccess, onCancel }: RecordExpenseFormProps) => {
    const { token } = useAppSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: '' as ExpenseType | '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidTo: '',
        isPaid: true,
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : (name === 'amount' ? value : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
            };
            await axios.post('/api/financial/expenses', submitData, config);
            onSuccess();
        } catch (error) {
            console.error('Error recording expense:', error);
            alert('فشل تسجيل المصروف. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Financial Details */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full"></span>
                    تفاصيل المصروف
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="input-group">
                        <label className="input-label">نوع المصروف *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">اختر النوع</option>
                            {EXPENSE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">المبلغ (ج.م) *</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="input-field font-bold text-lg"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">التاريخ *</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">المستفيد</label>
                        <input
                            type="text"
                            name="paidTo"
                            value={formData.paidTo}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="اسم المستفيد"
                        />
                    </div>

                    <div className="md:col-span-2 input-group">
                        <label className="input-label">الوصف</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="تفاصيل المصروف"
                        />
                    </div>
                </div>
            </div>

            <div className="input-group">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            name="isPaid"
                            checked={formData.isPaid}
                            onChange={handleChange}
                            className="peer sr-only"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-glow)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">تم دفع المبلغ بالفعل</span>
                </label>
            </div>

            <div className="input-group mb-6">
                <label className="input-label">ملاحظات</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="input-field resize-none min-h-[100px]"
                    placeholder="أي ملاحظات إضافية..."
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1"
                >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    تسجيل المصروف
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="btn-secondary flex-1"
                >
                    إلغاء
                </button>
            </div>
        </form>
    );
};

export default RecordExpenseForm;
