import { Play, CheckCircle, ClipboardList, MessageCircle, Loader2 } from 'lucide-react';
import type { Session } from '../../types';

interface SessionActionsProps {
    session: Session;
    onStartSession: () => void;
    onEndSession: () => void;
    onRecordAttendance: () => void;
    onContactParent: () => void;
    isLoading?: boolean;
    canContactParent?: boolean;
}

const SessionActions = ({
    session,
    onStartSession,
    onEndSession,
    onRecordAttendance,
    onContactParent,
    isLoading = false,
    canContactParent = false
}: SessionActionsProps) => {
    const { status } = session;

    return (
        <div className="flex flex-wrap gap-3">
            {/* Start Session Button */}
            {status === 'لم تبدأ' && (
                <button
                    onClick={onStartSession}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2 flex-1 min-w-[140px] justify-center"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Play size={18} />
                    )}
                    <span>بدء الجلسة</span>
                </button>
            )}

            {/* Record Attendance Button */}
            {status === 'بدأت' && (
                <button
                    onClick={onRecordAttendance}
                    className="btn-secondary flex items-center gap-2 flex-1 min-w-[140px] justify-center"
                >
                    <ClipboardList size={18} />
                    <span>تسجيل الحضور</span>
                </button>
            )}

            {/* End Session Button */}
            {status === 'بدأت' && (
                <button
                    onClick={onEndSession}
                    disabled={isLoading}
                    className="btn-gold flex items-center gap-2 flex-1 min-w-[140px] justify-center"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <CheckCircle size={18} />
                    )}
                    <span>إنهاء الجلسة</span>
                </button>
            )}

            {/* Contact Parent Button - Only for Student Affairs */}
            {canContactParent && status === 'بدأت' && (
                <button
                    onClick={onContactParent}
                    className="btn-outline flex items-center gap-2 min-w-[140px] justify-center"
                >
                    <MessageCircle size={18} />
                    <span>تواصل مع ولي الأمر</span>
                </button>
            )}

            {/* Session Completed Message */}
            {status === 'انتهت' && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 px-6 rounded-xl flex-1 justify-center">
                    <CheckCircle size={20} />
                    <span className="font-medium">انتهت الجلسة</span>
                </div>
            )}
        </div>
    );
};

export default SessionActions;
