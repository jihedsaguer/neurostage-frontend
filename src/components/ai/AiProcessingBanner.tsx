import { Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PollingStatus = 'processing' | 'success' | 'timeout';

interface AiProcessingBannerProps {
  status: PollingStatus | null;
  onRefresh?: () => void;
}

export const AiProcessingBanner = ({ status, onRefresh }: AiProcessingBannerProps) => {
  if (!status) return null;

  switch (status) {
    case 'processing':
      return (
        <Alert className={cn('border-blue-200 bg-blue-50 text-blue-900')}>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertTitle>AI is analyzing your CV…</AlertTitle>
          <AlertDescription className="text-blue-700/80">
            This may take up to 60 seconds. You can stay on this page.
          </AlertDescription>
        </Alert>
      );
    case 'success':
      return (
        <Alert className={cn('border-emerald-200 bg-emerald-50 text-emerald-900')}>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle>CV processed — your suggestions are ready</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 text-emerald-700/80">
            <span>Subject recommendations have been updated based on your profile.</span>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh suggestions
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    case 'timeout':
      return (
        <Alert className={cn('border-amber-200 bg-amber-50 text-amber-900')}>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Still processing — suggestions will appear when ready</AlertTitle>
          <AlertDescription className="text-amber-700/80">
            AI processing is taking longer than expected. Check back shortly.
          </AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
};
