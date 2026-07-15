import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string | number;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  actions,
  className = '',
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo === undefined) return;
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/40 backdrop-blur-xl ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          {backTo !== undefined && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          )}

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
