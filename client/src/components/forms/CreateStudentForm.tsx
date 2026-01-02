import { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { createStudent, fetchStudents } from '../../redux/slices/studentsSlice';
import { Loader2, Save, X } from 'lucide-react';
import type { Halqa, StudentStage } from '../../types';

interface CreateStudentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    halqat: Halqa[];
}

const CreateStudentForm = ({ onSuccess, onCancel, halqat }: CreateStudentFormProps) => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        stage: 'ابتدائي',
        halqa: '',
        guardian: {
            name: '',
            phone: '',
            relationship: 'أب'
        },
        memorized: {
            juzCount: 0,
            surahCount: 0
        },
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else if (name.startsWith('memorized.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                memorized: {
                    ...prev.memorized,
                    [field]: Number(value)
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await dispatch(createStudent({
                ...formData,
                age: Number(formData.age),
                stage: formData.stage as StudentStage
            } as any)).unwrap();
            dispatch(fetchStudents());
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'فشل إضافة الطالب');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
            {error && (
                <div className="p-4 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="form-section h-full">
                    <div className="form-section-header">
                        <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full"></span>
                        بيانات الطالب
                    </div>

                    <div className="input-group">
                        <label className="input-label">اسم الطالب</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="الاسم الثلاثي"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="input-group">
                            <label className="input-label">السن</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="مثال: 10"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">المرحلة الدراسية</label>
                            <select
                                name="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="ابتدائي">الابتدائية</option>
                                <option value="إعدادي">الإعدادية</option>
                                <option value="ثانوي">الثانوية</option>
                                <option value="جامعة">الجامعية</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group mt-4">
                        <label className="input-label">الحلقة</label>
                        <select
                            name="halqa"
                            value={formData.halqa}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">اختر الحلقة</option>
                            {halqat.map(halqa => (
                                <option key={halqa._id} value={halqa._id}>{halqa.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Guardian Info */}
                <div className="form-section h-full">
                    <div className="form-section-header">
                        <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
                        بيانات ولي الأمر
                    </div>

                    <div className="input-group">
                        <label className="input-label">اسم ولي الأمر</label>
                        <input
                            type="text"
                            name="guardian.name"
                            value={formData.guardian.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="الاسم"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="input-group">
                            <label className="input-label">رقم الهاتف</label>
                            <input
                                type="tel"
                                name="guardian.phone"
                                value={formData.guardian.phone}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">صلة القرابة</label>
                            <select
                                name="guardian.relationship"
                                value={formData.guardian.relationship}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="أب">أب</option>
                                <option value="أم">أم</option>
                                <option value="أخ">أخ</option>
                                <option value="أخت">أخت</option>
                                <option value="عم">عم</option>
                                <option value="عمة">عمة</option>
                                <option value="خال">خال</option>
                                <option value="خالة">خالة</option>
                                <option value="جد">جد</option>
                                <option value="جدة">جدة</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Memorization Info */}
            <div className="form-section mt-6">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    مستوى الحفظ الحالي
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="input-group">
                        <label className="input-label">عدد الأجزاء</label>
                        <input
                            type="number"
                            name="memorized.juzCount"
                            value={formData.memorized.juzCount}
                            onChange={handleChange}
                            className="input-field"
                            min="0"
                            max="30"
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="input-group mt-6">
                <label className="input-label">ملاحظات إضافية</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field min-h-[80px]"
                    placeholder="أي ملاحظات أو معلومات صحية هامة..."
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1 py-3"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    حفظ البيانات
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

export default CreateStudentForm;
