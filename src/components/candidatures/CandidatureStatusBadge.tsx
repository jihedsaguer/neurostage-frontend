import type { CanditatureStatus } from '@/types/canditatures';
import { CANDIDATURE_STATUS_COLORS, CANDIDATURE_STATUS_LABELS } from '@/types/canditatures';

interface CandidatureStatusBadgeProps {
  status: CanditatureStatus;
  className?: string;
}

const CandidatureStatusBadge = ({ status, className = '' }: CandidatureStatusBadgeProps) => {
  const colorClass = CANDIDATURE_STATUS_COLORS[status];
  const label = CANDIDATURE_STATUS_LABELS[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

export default CandidatureStatusBadge;
