import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { updateStudent } from '../../redux/slices/studentsSlice';
import type { Student, Halqa, StudentStage, StudentStatus } from '../../types';
import { Loader2 } from 'lucide-react';

interface EditStudentFormProps {
    student: Student;
    onSuccess: () => void;
    onCancel: () => void;
    halqat: Halqa[];
}

const STUDENT_STAGES: StudentStage[] = ['ابتدائي', 'إعدادي', 'ثانوي', 'جامعة'];
const STUDENT_STATUSES: StudentStatus[] = ['منتظم', 'منقطع', 'متوقف'];

const EditStudentForm = ({ student, onSuccess, onCancel, halqat }: EditStudentFormProps) => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        stage: '' as StudentStage,
        halqa: '',
        status: 'منتظم' as StudentStatus,
        currentJuz: 0,
        currentSurah: '',
        notes: '',
    });

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                age: student.age?.toString() || '',
                stage: student.stage,
                halqa: (typeof student.halqa === 'object' ? student.halqa._id : student.halqa) || '',
                status: student.status,
                currentJuz: student.currentJuz,
                currentSurah: student.currentSurah,
                notes: student.notes || '',
            });
        }
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'currentJuz' ? (value ? parseInt(value) : '') : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = {
                ...formData,
                age: formData.age ? parseInt(formData.age as string) : undefined,
                currentJuz: formData.currentJuz || 0,
            };
            await dispatch(updateStudent({ id: student._id, data: submitData as any })).unwrap();
            onSuccess();
        } catch (error) {
            console.error('Error updating student:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Academic Info */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full"></span>
                    بيانات الطالب
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 input-group">
                        <label className="input-label">اسم الطالب *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="أدخل اسم الطالب"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">العمر</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            min="5"
                            max="99"
                            className="input-field"
                            placeholder="العمر"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">المرحلة الدراسية *</label>
                        <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            {STUDENT_STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">الحلقة *</label>
                        <select
                            name="halqa"
                            value={formData.halqa}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            {halqat.map(halqa => (
                                <option key={halqa._id} value={halqa._id}>{halqa.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">الحالة *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            {STUDENT_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Memorization Progress */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
                    مستوى الحفظ
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="input-group">
                        <label className="input-label">الجزء الحالي</label>
                        <input
                            type="number"
                            name="currentJuz"
                            value={formData.currentJuz}
                            onChange={handleChange}
                            min="0"
                            max="30"
                            className="input-field"
                            placeholder="رقم الجزء"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">السورة الحالية</label>
                        <input
                            type="text"
                            name="currentSurah"
                            value={formData.currentSurah}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="اسم السورة"
                        />
                    </div>
                </div>
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
                    حفظ التغييرات
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

export default EditStudentForm;
