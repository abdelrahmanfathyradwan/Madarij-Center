import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import {
    LayoutDashboard,
    Users,
    Circle,
    BookOpen,
    Wallet,
    LogOut,
    X,
    UserCircle,
    Settings,
    UserPlus,
    Calendar
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const links = [
        { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, roles: ['director', 'supervisor', 'teacher', 'student_affairs'] },
        { path: '/students', label: 'الطلاب', icon: <Users size={20} />, roles: ['director', 'student_affairs', 'supervisor'] },
        { path: '/halqat', label: 'الحلقات', icon: <Circle size={20} />, roles: ['director', 'supervisor'] },
        { path: '/sessions', label: 'تسميع', icon: <BookOpen size={20} />, roles: ['director', 'supervisor', 'teacher'] },
        { path: '/onboarding', label: 'تسجيل جديد', icon: <UserPlus size={20} />, roles: ['director', 'student_affairs'] },
        { path: '/interviews', label: 'المقابلات', icon: <Calendar size={20} />, roles: ['director'] },
        { path: '/friday', label: 'إدارة الجمعة', icon: <Calendar size={20} />, roles: ['director'] },
        { path: '/financial', label: 'الإدارة المالية', icon: <Wallet size={20} />, roles: ['director'] },
        { path: '/users', label: 'إدارة المستخدمين', icon: <Users size={20} />, roles: ['director'] },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:sticky top-0 right-0 h-screen w-72 
                bg-[#1e293b] border-l border-[#334155]
                transform transition-transform duration-300 z-50 flex flex-col
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>

                {/* Header */}
                <div className="h-24 flex flex-row items-center gap-2 px-6 border-b border-[#334155] justify-center">

                    <img src='/logo.jpg' alt="logo" width={200} height={200} className="hidden md:block object-contain rounded-lg w-20 h-20" />

                    <div>
                        <h1 className="text-lg font-bold text-white font-['Cairo']">مركز مدارج</h1>
                        <p className="text-xs text-gray-400">نظام الإدارة</p>
                    </div>
                    <button onClick={onClose} className="lg:hidden mr-auto text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-y-6 flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {links.filter(link => link.roles.includes(user?.role || '')).map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`
                                    flex flex-row items-center justify-start gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                                    font-['Cairo'] font-medium text-lg w-full
                                    ${isActive
                                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                                        : 'text-gray-400 hover:bg-[#334155]/50 hover:text-white'
                                    }
                                `}
                            >
                                <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                                    {link.icon}
                                </span>
                                <span className='text-start'>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Actions */}
                <div className="p-4 border-t border-[#334155] bg-[#1e293b]">
                    <div className="flex flex-row items-center gap-2 mb-4 px-4">
                        <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-gray-300 shrink-0">
                            <UserCircle size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate font-['Cairo']">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.roleDisplay}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button className="flex flex-row items-center justify-start gap-4 px-4 py-3 rounded-lg transition-all duration-200 group font-['Cairo'] font-medium text-lg w-full text-gray-400 hover:bg-[#334155]/50 hover:text-white">
                            <Settings size={20} />
                            <span className="text-start">إعدادات</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex flex-row items-center justify-start gap-4 px-4 py-3 rounded-lg transition-all duration-200 group font-['Cairo'] font-medium text-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut size={20} />
                            <span className="text-start">خروج</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
