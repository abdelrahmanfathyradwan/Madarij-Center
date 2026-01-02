
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSelector } from '../redux/hooks';
import { UserPlus, Trash2, Mail, Phone, Shield } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
}

const UsersPage = () => {
    const { token, user: currentUser } = useAppSelector(state => state.auth);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        phone: ''
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/users', {
                params: { isActive: true },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users || res.data);
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('تم إضافة المستخدم بنجاح');
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', role: 'teacher', phone: '' });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'فشل إضافة المستخدم');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await axios.delete(`/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert('فشل الحذف');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                        إدارة فريق العمل
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">إضافة وإدارة المشرفين والمعلمين</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <UserPlus size={18} />
                    <span>إضافة مستخدم</span>
                </button>
            </div>

            {/* Add User Form */}
            {showForm && (
                <div className="mb-8 bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                    <h2 className="text-lg font-bold mb-4">بيانات المستخدم الجديد</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="الاسم كامل" title="Name"
                            className="input-field p-2 rounded border bg-[var(--bg-tertiary)]"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="البريد الإلكتروني" type="email" title="Email"
                            className="input-field p-2 rounded border bg-[var(--bg-tertiary)]"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            placeholder="كلمة المرور" type="password" title="Password"
                            className="input-field p-2 rounded border bg-[var(--bg-tertiary)]"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <input
                            placeholder="رقم الهاتف" title="Phone"
                            className="input-field p-2 rounded border bg-[var(--bg-tertiary)]"
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <select
                            className="input-field p-2 rounded border bg-[var(--bg-tertiary)]" title="Role"
                            value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="teacher">معلم</option>
                            <option value="supervisor">مشرف</option>
                            <option value="student_affairs">شؤون طلاب</option>
                            <option value="director">مدير</option>
                        </select>
                        <div className="col-span-full flex gap-2 justify-end mt-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">حفظ</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">إلغاء</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(user => (
                        <div key={user._id} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-primary)]">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{user.name}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                {user._id !== currentUser?._id && (
                                    <button onClick={() => handleDelete(user._id)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} />
                                    <span>{user.phone || 'غير مسجل'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersPage;
