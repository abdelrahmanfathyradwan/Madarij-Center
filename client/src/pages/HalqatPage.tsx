import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchHalqat, deleteHalqa } from '../redux/slices/halqatSlice';
import { fetchUsers } from '../redux/slices/usersSlice';
import { fetchClassrooms } from '../redux/slices/classroomsSlice';
import { BookOpen, Users, Clock, Plus, Search, Loader2, Calendar, User, Edit, Trash2 } from 'lucide-react';
import type { Halqa } from '../types';
import Modal from '../components/common/Modal';
import CreateHalqaForm from '../components/forms/CreateHalqaForm';
import EditHalqaForm from '../components/forms/EditHalqaForm';
import DeleteConfirmation from '../components/common/DeleteConfirmation';

const HalqaCard = ({ halqa, onClick, canManage, onEdit, onDelete }: { halqa: Halqa; onClick: () => void; canManage: boolean; onEdit: () => void; onDelete: () => void }) => (
    <div onClick={onClick} className="card cursor-pointer hover:border-[var(--accent-primary)] transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-primary)]/20">
                <BookOpen size={24} className="text-[var(--accent-gold)]" />
            </div>
            <div className="flex items-center gap-2">
                <span className={`badge ${halqa.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {halqa.isActive ? 'نشطة' : 'متوقفة'}
                </span>
                {canManage && (
                    <div className="flex gap-2 mr-2">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 hover:text-[var(--accent-primary)] text-[var(--text-secondary)] transition-colors">
                            <Edit size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-500 text-[var(--text-secondary)] transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
        <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{halqa.name}</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2"><User size={14} /><span>المعلم: {typeof halqa.teacher === 'object' ? halqa.teacher.name : '-'}</span></div>
            <div className="flex items-center gap-2"><Users size={14} /><span>{halqa.studentCount || 0} طالب</span></div>
            <div className="flex items-center gap-2"><Clock size={14} /><span>{halqa.startTime} - {halqa.endTime}</span></div>
            <div className="flex items-center gap-2"><Calendar size={14} /><span>{halqa.days?.join(' - ') || '-'}</span></div>
        </div>
    </div>
);

const HalqatPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { halqat, isLoading } = useAppSelector((state) => state.halqat);
    const { teachers, supervisors } = useAppSelector((state) => state.users);
    const { classrooms } = useAppSelector((state) => state.classrooms);
    const { user } = useAppSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedHalqa, setSelectedHalqa] = useState<Halqa | null>(null);

    useEffect(() => {
        dispatch(fetchHalqat());
        dispatch(fetchUsers('teacher'));
        dispatch(fetchUsers('supervisor'));
        dispatch(fetchClassrooms());
    }, [dispatch]);


    const filteredHalqat = halqat.filter(h => h.name.includes(searchTerm));
    const canManage = user?.role === 'director' || user?.role === 'supervisor';

    const handleEdit = (halqa: Halqa) => {
        setSelectedHalqa(halqa);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (halqa: Halqa) => {
        setSelectedHalqa(halqa);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedHalqa) {
            await dispatch(deleteHalqa(selectedHalqa._id)).unwrap();
            setIsDeleteModalOpen(false);
            setSelectedHalqa(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الحلقات</h1>
                    <p className="text-[var(--text-secondary)]">إدارة حلقات تحفيظ القرآن الكريم</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        إضافة حلقة
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="بحث عن حلقة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 h-14"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" /></div>
            ) : filteredHalqat.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHalqat.map((halqa) => (
                        <HalqaCard
                            key={halqa._id}
                            halqa={halqa}
                            onClick={() => navigate(`/halqat/${halqa._id}`)}
                            canManage={canManage}
                            onEdit={() => handleEdit(halqa)}
                            onDelete={() => handleDeleteClick(halqa)}
                        />
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <BookOpen size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا توجد حلقات</h3>
                    <p className="text-[var(--text-secondary)]">{searchTerm ? 'لم يتم العثور على نتائج' : 'ابدأ بإضافة حلقة جديدة'}</p>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="إضافة حلقة جديدة"
            >
                <CreateHalqaForm
                    onSuccess={() => setIsCreateModalOpen(false)}
                    onCancel={() => setIsCreateModalOpen(false)}
                    teachers={teachers}
                    supervisors={supervisors}
                    classrooms={classrooms}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="تعديل بيانات الحلقة"
            >
                {selectedHalqa && (
                    <EditHalqaForm
                        halqa={selectedHalqa}
                        onSuccess={() => setIsEditModalOpen(false)}
                        onCancel={() => setIsEditModalOpen(false)}
                        teachers={teachers}
                        supervisors={supervisors}
                        classrooms={classrooms}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="حذف الحلقة"
            >
                <DeleteConfirmation
                    title="هل أنت متأكد من حذف الحلقة؟"
                    message={`سيتم حذف بيانات الحلقة "${selectedHalqa?.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default HalqatPage;
