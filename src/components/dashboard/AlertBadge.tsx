interface AlertBadgeProps {
  count: number;
  label: string;
  severity: 'high' | 'medium' | 'low';
  onClick?: () => void;
}

const severityStyles = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-blue-50 border-blue-200 text-blue-700',
};

export function AlertBadge({ count, label, severity, onClick }: AlertBadgeProps) {
  if (count === 0) return null;
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${severityStyles[severity]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}
