import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { updateHalqa } from '../../redux/slices/halqatSlice';
import type { User, ArabicDay, Halqa, Classroom } from '../../types';
import { Loader2 } from 'lucide-react';

interface EditHalqaFormProps {
    halqa: Halqa;
    onSuccess: () => void;
    onCancel: () => void;
    teachers: User[];
    supervisors: User[];
    classrooms: Classroom[];
}

const ARABIC_DAYS: ArabicDay[] = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const EditHalqaForm = ({ halqa, onSuccess, onCancel, teachers, supervisors, classrooms }: EditHalqaFormProps) => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        teacher: '',
        supervisor: '',
        classroom: '',
        days: [] as ArabicDay[],
        startTime: '',
        endTime: '',
        maxStudents: 15,
        sessionDuration: 60,
        isActive: true,
    });

    useEffect(() => {
        if (halqa) {
            setFormData({
                name: halqa.name,
                teacher: typeof halqa.teacher === 'object' ? halqa.teacher._id : halqa.teacher,
                supervisor: typeof halqa.supervisor === 'object' ? halqa.supervisor._id : halqa.supervisor,
                classroom: typeof halqa.classroom === 'object' ? halqa.classroom._id : halqa.classroom,
                days: halqa.days || [],
                startTime: halqa.startTime,
                endTime: halqa.endTime,
                maxStudents: halqa.maxStudents,
                sessionDuration: halqa.sessionDuration,
                isActive: halqa.isActive,
            });
        }
    }, [halqa]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : (name === 'maxStudents' || name === 'sessionDuration' ? parseInt(value) || 0 : value)
        }));
    };

    const handleDayToggle = (day: ArabicDay) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await dispatch(updateHalqa({ id: halqa._id, data: formData })).unwrap();
            onSuccess();
        } catch (error) {
            console.error('Error updating halqa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Basic Info */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full"></span>
                    بيانات الحلقة الأساسية
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 input-group">
                        <label className="input-label">اسم الحلقة</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="أدخل اسم الحلقة"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">الفصل الدراسي</label>
                        <select
                            name="classroom"
                            value={formData.classroom}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">اختر الفصل</option>
                            {classrooms.map(classroom => (
                                <option key={classroom._id} value={classroom._id}>{classroom.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">المعلم</label>
                        <select
                            name="teacher"
                            value={formData.teacher}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">اختر المعلم</option>
                            {teachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">المشرف</label>
                        <select
                            name="supervisor"
                            value={formData.supervisor}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">اختر المشرف</option>
                            {supervisors.map(supervisor => (
                                <option key={supervisor._id} value={supervisor._id}>{supervisor.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Schedule & Capacity */}
            <div className="form-section">
                <div className="form-section-header">
                    <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
                    المواعيد والسعة
                </div>

                <div className="input-group mb-4">
                    <label className="input-label">أيام الحلقات</label>
                    <div className="flex flex-wrap gap-2">
                        {ARABIC_DAYS.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleDayToggle(day)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${formData.days.includes(day)
                                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-lg shadow-emerald-500/20'
                                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                        <label className="input-label">وقت البداية</label>
                        <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">وقت النهاية</label>
                        <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">مدة الجلسة (دقيقة)</label>
                        <input
                            type="number"
                            name="sessionDuration"
                            value={formData.sessionDuration}
                            onChange={handleChange}
                            required
                            min="15"
                            step="15"
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">الحد الأقصى للطلاب</label>
                        <input
                            type="number"
                            name="maxStudents"
                            value={formData.maxStudents}
                            onChange={handleChange}
                            required
                            min="1"
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            <div className="input-group">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="peer sr-only"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-glow)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">الحلقة نشطة ومتاحة للتسجيل</span>
                </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                    type="submit"
                    disabled={isLoading || formData.days.length === 0}
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

export default EditHalqaForm;
