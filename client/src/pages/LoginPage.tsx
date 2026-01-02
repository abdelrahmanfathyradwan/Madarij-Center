import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { login, clearError } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-[var(--bg-primary)] overflow-hidden">
            {/* Background Pattern */}
            <div className="pattern-overlay"></div>

            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 w-full max-w-md px-4 animate-slideUp">
                <div className="card-glass border border-white/10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Lock className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 font-['Cairo'] text-white">تسجيل الدخول</h1>
                        <p className="text-[var(--text-secondary)] font-['Tajawal']">مرحباً بك في نظام إدارة مركز مدارج</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-fadeIn">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] mr-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10 bg-[var(--bg-secondary)] border-transparent focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)] h-12"
                                    placeholder="example@madarij.com"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors duration-300" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] mr-1">كلمة المرور</label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10 bg-[var(--bg-secondary)] border-transparent focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)] h-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors duration-300" size={20} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full h-12 text-lg mt-4 group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <span>دخول</span>
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-[var(--text-muted)]">
                            جميع الحقوق محفوظة © {new Date().getFullYear()} مركز مدارج
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
