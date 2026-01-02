import { useState } from 'react';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationProps {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

const DeleteConfirmation = ({ title, message, onConfirm, onCancel }: DeleteConfirmationProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Delete failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-5 text-red-500 shadow-inner">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2.5">{title}</h3>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{message}</p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Trash2 size={20} />}
                    <span>تأكيد الحذف</span>
                </button>
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 btn-secondary py-4"
                >
                    إلغاء
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmation;
