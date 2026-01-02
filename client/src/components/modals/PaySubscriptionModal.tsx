import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import type { Subscription } from '../../types';

interface PaySubscriptionModalProps {
    subscription: Subscription;
    onClose: () => void;
    onSuccess: () => void;
    onPay: (id: string, data: any) => Promise<void>;
}

const PaySubscriptionModal = ({ subscription, onClose, onSuccess, onPay }: PaySubscriptionModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(subscription.amount.toString());
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onPay(subscription._id, {
                status: 'مدفوع',
                paidAmount: Number(amount),
                notes
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const studentName = typeof subscription.student === 'object' ? subscription.student.name : 'الطالب';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-xl w-full max-w-md border border-[var(--border-color)]">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">تسجيل دفع اشتراك</h2>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">الطالب</p>
                        <p className="font-bold text-lg">{studentName}</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">الشهر: {subscription.monthNumber} / {subscription.year}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">المبلغ المدفوع (ج.م)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field w-full"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                        <p className="text-xs text-[var(--text-secondary)] mt-1">المبلغ المطلوب: {subscription.amount} ج.م</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ملاحظات</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field w-full min-h-[80px]"
                            placeholder="أي ملاحظات إضافية..."
                        />
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost flex-1"
                            disabled={isLoading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            <span>تأكيد الدفع</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaySubscriptionModal;
