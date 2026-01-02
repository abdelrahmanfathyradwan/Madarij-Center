import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchStudents, deleteStudent } from '../redux/slices/studentsSlice';
import { fetchHalqat } from '../redux/slices/halqatSlice';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    BookOpen,
    Loader2,
    Filter,
    Phone,
    UserCheck,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import CreateStudentForm from '../components/forms/CreateStudentForm';
import EditStudentForm from '../components/forms/EditStudentForm';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import type { Student, Halqa, Guardian } from '../types';

const StudentsPage = () => {
    const dispatch = useAppDispatch();
    const { students, isLoading } = useAppSelector((state) => state.students);
    const { halqat } = useAppSelector((state) => state.halqat);
    const { user } = useAppSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterHalqa, setFilterHalqa] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchHalqat());
    }, [dispatch]);

    const getHalqaName = (halqa: string | Halqa | undefined) => {
        if (!halqa) return 'غير محدد';
        if (typeof halqa === 'string') return 'غير محدد'; // Or find by ID if needed
        return halqa.name;
    };

    const getHalqaId = (halqa: string | Halqa | undefined) => {
        if (!halqa) return '';
        if (typeof halqa === 'string') return halqa;
        return halqa._id;
    };

    const getGuardianName = (guardian: string | Guardian | undefined) => {
        if (!guardian) return '-';
        if (typeof guardian === 'string') return '-';
        return guardian.name;
    };

    const getGuardianPhone = (guardian: string | Guardian | undefined) => {
        if (!guardian) return '';
        if (typeof guardian === 'string') return '';
        return guardian.phone;
    };

    const filteredStudents = students.filter(student => {
        const guardianName = getGuardianName(student.guardian);
        const guardianPhone = getGuardianPhone(student.guardian);

        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardianPhone?.includes(searchTerm) ||
            guardianName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesHalqa = filterHalqa ? getHalqaId(student.halqa) === filterHalqa : true;
        return matchesSearch && matchesHalqa;
    });

    const handleDelete = async () => {
        if (deletingStudent) {
            await dispatch(deleteStudent(deletingStudent._id));
            setDeletingStudent(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            'منتظم': 'badge-success',
            'منقطع': 'badge-danger',
            'متوقف': 'badge-warning',
            'خاتم': 'badge-info'
        };
        const style = styles[status] || 'badge-secondary';

        return (
            <span className={`badge ${style}`}>
                {status}
            </span>
        );
    };

    if (isLoading && students.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-['Cairo']">الطلاب</h1>
                    <p className="text-[var(--text-secondary)]">إدارة بيانات الطلاب والحلقات</p>
                </div>
                {(user?.role === 'director' || user?.role === 'student_affairs') && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={20} />
                        إضافة طالب جديد
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2">
                        <input
                            type="text"
                            placeholder="بحث عن طالب (الاسم أو رقم الهاتف)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 h-14"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    </div>
                    <div className="relative">
                        <select
                            value={filterHalqa}
                            onChange={(e) => setFilterHalqa(e.target.value)}
                            className="input-field h-14 appearance-none"
                        >
                            <option value="">جميع الحلقات</option>
                            {halqat.map(halqa => (
                                <option key={halqa._id} value={halqa._id}>{halqa.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {!isLoading && filteredStudents.length === 0 && (
                <div className="card text-center py-12">
                    <User size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا يوجد طلاب</h3>
                    <p className="text-[var(--text-secondary)]">
                        {searchTerm || filterHalqa ? 'لا توجد نتائج تطابق بحثك' : 'لم يتم إضافة أي طلاب بعد'}
                    </p>
                </div>
            )}

            {/* Table */}
            {filteredStudents.length > 0 && (
                <div className="card overflow-hidden p-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">الطالب</th>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">الحلقة</th>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">الحفظ</th>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">ولي الأمر</th>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">الحالة</th>
                                    <th className="px-6 py-4 font-semibold text-[var(--text-secondary)]">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id} className="group hover:bg-[var(--bg-hover)]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)]">{student.name}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">{student.age} سنة</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <BookOpen size={16} className="text-[var(--text-muted)]" />
                                                <span>{getHalqaName(student.halqa)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p><span className="text-[var(--text-muted)]">جزء:</span> {student.currentJuz || 0}</p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{student.currentSurah || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="flex items-center gap-1.5">
                                                    <UserCheck size={14} className="text-[var(--text-muted)]" />
                                                    {getGuardianName(student.guardian)}
                                                </p>
                                                <p className="flex items-center gap-1.5 mt-1 text-[var(--text-secondary)] font-mono dir-ltr text-right">
                                                    <Phone size={14} />
                                                    {getGuardianPhone(student.guardian)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={student.status || 'منتظم'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingStudent(student)}
                                                    className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {(user?.role === 'director' || user?.role === 'student_affairs') && (
                                                    <button
                                                        onClick={() => setDeletingStudent(student)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="إضافة طالب جديد"
            >
                <CreateStudentForm
                    halqat={halqat}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        dispatch(fetchStudents());
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                title="تعديل بيانات الطالب"
            >
                {editingStudent && (
                    <EditStudentForm
                        student={editingStudent}
                        halqat={halqat}
                        onSuccess={() => {
                            setEditingStudent(null);
                            dispatch(fetchStudents());
                        }}
                        onCancel={() => setEditingStudent(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation is handled by Custom Modal logic usually, or just a Modal with content */}
            <Modal
                isOpen={!!deletingStudent}
                onClose={() => setDeletingStudent(null)}
                title="حذف الطالب"
            >
                <DeleteConfirmation
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingStudent(null)}
                    title="تأكيد الحذف"
                    message={`هل أنت متأكد من رغبتك في حذف الطالب "${deletingStudent?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                />
            </Modal>
        </div>
    );
};

export default StudentsPage;

