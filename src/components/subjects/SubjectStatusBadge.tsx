import type { SubjectStatus } from '@/types/subject.types';
import { SUBJECT_STATUS_COLORS, SUBJECT_STATUS_LABELS } from '@/types/subject.types';

interface SubjectStatusBadgeProps {
  status: SubjectStatus;
  className?: string;
}

const SubjectStatusBadge = ({ status, className = '' }: SubjectStatusBadgeProps) => {
  const colorClass = SUBJECT_STATUS_COLORS[status];
  const label = SUBJECT_STATUS_LABELS[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

export default SubjectStatusBadge;
