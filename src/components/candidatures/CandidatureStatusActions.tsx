import { Button } from '@/components/ui/button';
import type { CanditatureStatus } from '@/types/canditatures';

interface CandidatureStatusActionsProps {
  currentStatus: CanditatureStatus;
  onChange: (status: CanditatureStatus) => void;
  loading?: boolean;
}

const STATUS_ACTIONS: Array<{ value: CanditatureStatus; label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = [
  { value: 'accepted', label: 'Accept', variant: 'default' },
  { value: 'shortlisted', label: 'Shortlist', variant: 'secondary' },
  { value: 'rejected', label: 'Reject', variant: 'destructive' },
];

const CandidatureStatusActions = ({ currentStatus, onChange, loading = false }: CandidatureStatusActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_ACTIONS.map((action) => (
        <Button
          key={action.value}
          variant={action.variant === 'default' ? 'default' : action.variant}
          size="sm"
          onClick={() => onChange(action.value)}
          disabled={loading || currentStatus === action.value}
          className={currentStatus === action.value ? 'opacity-70 cursor-not-allowed' : ''}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default CandidatureStatusActions;
