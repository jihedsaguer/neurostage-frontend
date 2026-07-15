import type { JalonStatus } from '@/types/jalon.types';
import { JALON_STATUS_LABELS, JALON_STATUS_COLORS } from '@/types/jalon.types';

interface Props {
  status: JalonStatus;
  className?: string;
}

const JalonStatusBadge = ({ status, className = '' }: Props) => {
  const label = JALON_STATUS_LABELS[status];
  return (
    <span
      role="status"
      aria-label={`Statut du jalon : ${label}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${JALON_STATUS_COLORS[status]} ${className}`}
    >
      {label}
    </span>
  );
};

export default JalonStatusBadge;
