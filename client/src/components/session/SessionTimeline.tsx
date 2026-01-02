import { Check, Circle, Clock, Play } from 'lucide-react';
import type { SessionStatus } from '../../types';

interface SessionTimelineProps {
    status: SessionStatus;
    startedAt?: string;
    endedAt?: string;
}

const SessionTimeline = ({ status, startedAt, endedAt }: SessionTimelineProps) => {
    const steps = [
        { status: 'لم تبدأ' as const, label: 'لم تبدأ', icon: Circle },
        { status: 'بدأت' as const, label: 'جارية', icon: Play },
        { status: 'انتهت' as const, label: 'انتهت', icon: Check },
    ];

    const currentIndex = steps.findIndex(s => s.status === status);

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex items-center justify-between w-full py-4">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                    <div key={step.status} className="flex items-center flex-1">
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : isActive
                                        ? 'bg-(--accent-primary) text-white animate-pulse-soft'
                                        : 'bg-(--bg-tertiary) text-(--text-muted)'
                                    }`}
                            >
                                <Icon size={20} />
                            </div>
                            <span
                                className={`mt-2 text-sm font-medium ${isActive
                                    ? 'text-(--accent-primary)'
                                    : isCompleted
                                        ? 'text-emerald-400'
                                        : 'text-(--text-muted)'
                                    }`}
                            >
                                {step.label}
                            </span>
                            {/* Time indicator */}
                            {index === 1 && startedAt && (
                                <span className="text-xs text-(--text-secondary) flex items-center gap-1 mt-1">
                                    <Clock size={10} />
                                    {formatTime(startedAt)}
                                </span>
                            )}
                            {index === 2 && endedAt && (
                                <span className="text-xs text-(--text-secondary) flex items-center gap-1 mt-1">
                                    <Clock size={10} />
                                    {formatTime(endedAt)}
                                </span>
                            )}
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${isCompleted
                                    ? 'bg-emerald-500'
                                    : 'bg-(--bg-tertiary)'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SessionTimeline;
