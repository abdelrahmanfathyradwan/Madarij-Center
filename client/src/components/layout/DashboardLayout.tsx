import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from '../common/NotificationBell';



const Header = ({ setIsMobileOpen }: { setIsMobileOpen: (isOpen: boolean) => void }) => {
    const { user } = useAppSelector((state) => state.auth);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isFriday = currentTime.getDay() === 5;

    return (
        <header className="bg-[var(--bg-secondary)] border border-[var(--border-color)] m-6 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-white"
            >
                <Menu size={24} />
            </button>

            <div className="flex-1 flex items-center justify-between ml-4">
                <div>
                    <h2 className="text-xl font-bold space-x-2">مرحباً، {user?.name}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {formatDate(currentTime)} - {formatTime(currentTime)}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    {user?.role === 'director' && <NotificationBell />}

                    {isFriday && (
                        <div className="badge badge-warning flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
                            يوم الجمعة - يوم تربوي
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const DashboardLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)] pattern-bg">
            <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header setIsMobileOpen={setIsMobileOpen} />
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
