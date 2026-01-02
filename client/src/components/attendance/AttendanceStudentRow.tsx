import { Check, X, Clock, AlertCircle } from 'lucide-react';
import type { AttendanceStatus, Student, Attendance } from '../../types';

interface AttendanceStudentRowProps {
    student: Student;
    attendance?: Attendance;
    onStatusChange: (studentId: string, status: AttendanceStatus, absenceReason?: string) => void;
    onContactParent?: (student: Student) => void;
    showContactButton?: boolean;
}

const AttendanceStudentRow = ({
    student,
    attendance,
    onStatusChange,
    onContactParent,
    showContactButton = false
}: AttendanceStudentRowProps) => {
    const currentStatus = attendance?.status || null;

    const statusButtons: { status: AttendanceStatus; icon: React.ReactNode; label: string; color: string }[] = [
        { status: 'حاضر', icon: <Check size={16} />, label: 'حاضر', color: 'emerald' },
        { status: 'غائب', icon: <X size={16} />, label: 'غائب', color: 'red' },
        { status: 'متأخر', icon: <Clock size={16} />, label: 'متأخر', color: 'amber' },
        { status: 'مستأذن', icon: <AlertCircle size={16} />, label: 'مستأذن', color: 'blue' },
    ];

    const getButtonClass = (status: AttendanceStatus, color: string) => {
        const isActive = currentStatus === status;
        const baseClass = 'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all';

        if (isActive) {
            const activeClasses: Record<string, string> = {
                emerald: 'bg-emerald-500 text-white',
                red: 'bg-red-500 text-white',
                amber: 'bg-amber-500 text-white',
                blue: 'bg-blue-500 text-white',
            };
            return `${baseClass} ${activeClasses[color]}`;
        }

        const inactiveClasses: Record<string, string> = {
            emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
            red: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
            amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
            blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
        };
        return `${baseClass} ${inactiveClasses[color]}`;
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-(--bg-card) border border-(--border-color) hover:border-(--accent-primary)/30 transition-all">
            {/* Student Info */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-(--accent-primary) font-bold">
                    {student.name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-(--text-primary)">{student.name}</h4>
                    <p className="text-sm text-(--text-secondary)">{student.stage}</p>
                </div>
            </div>

            {/* Status Buttons */}
            <div className="flex items-center gap-2">
                {statusButtons.map(({ status, icon, label, color }) => (
                    <button
                        key={status}
                        onClick={() => onStatusChange(student._id, status)}
                        className={getButtonClass(status, color)}
                        title={label}
                    >
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}

                {/* Contact Parent Button */}
                {showContactButton && currentStatus === 'غائب' && onContactParent && (
                    <button
                        onClick={() => onContactParent(student)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-(--accent-primary)/10 text-(--accent-primary) hover:bg-(--accent-primary)/20 transition-all mr-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="hidden sm:inline">واتساب</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AttendanceStudentRow;
