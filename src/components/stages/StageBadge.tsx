import type { StageStatus } from '@/types/stage.types';
import { STAGE_STATUS_COLORS, STAGE_STATUS_LABELS } from '@/types/stage.types';

interface StageBadgeProps {
  status: StageStatus;
  className?: string;
}

const StageBadge = ({ status, className = '' }: StageBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_STATUS_COLORS[status]} ${className}`}
  >
    {STAGE_STATUS_LABELS[status]}
  </span>
);

export default StageBadge;
