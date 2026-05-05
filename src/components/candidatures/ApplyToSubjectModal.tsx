import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ApplyToSubjectModalProps {
  open: boolean;
  motivation: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const ApplyToSubjectModal = ({
  open,
  motivation,
  isSubmitting,
  error,
  onClose,
  onChange,
  onSubmit,
}: ApplyToSubjectModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Apply to this subject</CardTitle>
            <CardDescription>
              Submit your motivation for this subject. Your application will be visible in My Candidatures.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-slate-700">
              Motivation
            </label>
            <textarea
              id="motivation"
              value={motivation}
              onChange={(event) => onChange(event.target.value)}
              rows={6}
              className="mt-2 w-full min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Describe why you're a great fit for this subject..."
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} className="w-full sm:w-auto" disabled={isSubmitting || motivation.trim().length === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyToSubjectModal;
