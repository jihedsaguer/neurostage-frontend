import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { useListMyCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import CandidatureList from '@/components/candidatures/CandidatureList';

const MyCandidaturesPage = () => {
  const navigate = useNavigate();
  const { data: candidatures = [], isLoading, isError } = useListMyCandidaturesQuery();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">My Candidatures</h1>
              <p className="text-slate-500 text-sm">Review the status of every application you submitted.</p>
            </div>
          </div>

          <Button onClick={() => navigate('/subjects')}>
            Browse Validated Subjects
          </Button>
        </div>

        {isError && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-6 text-red-700">Failed to load candidatures. Please refresh the page.</CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isError && candidatures.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h2>
            <p className="text-sm text-slate-600 mb-6">
              Browse the validated subjects catalogue and submit your first candidature.
            </p>
            <Button onClick={() => navigate('/subjects')}>
              Browse Subjects
            </Button>
          </div>
        )}

        {!isLoading && !isError && candidatures.length > 0 && (
          <div className="space-y-4">
            <CandidatureList
              candidatures={candidatures}
              onViewSubject={(subjectId) => navigate(`/subjects/${subjectId}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCandidaturesPage;
