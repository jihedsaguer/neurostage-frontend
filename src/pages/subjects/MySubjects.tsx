import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchMySubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import { useAiFeatures } from '@/lib/hooks/useAiFeatures';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import GenerateDraftSheet from '@/components/ai/GenerateDraftSheet';
import { PlusCircle, Lightbulb, Eye, Sparkles } from 'lucide-react';

const MySubjects = () => {
  const navigate = useNavigate();
  const { canGenerateDraft } = useAiFeatures();
  const [draftOpen, setDraftOpen] = useState(false);
  const { data: response, isLoading, isError } = useFetchMySubjectsQuery({});
  const subjects = response?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="My Subjects"
          subtitle="All subjects you have proposed, with quick access to edit and view details."
          backTo={-1}
          actions={
            <div className="flex flex-wrap gap-2">
              {canGenerateDraft && (
                <Button variant="outline" onClick={() => setDraftOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                  <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                    ✨ AI
                  </Badge>
                </Button>
              )}
              <Button onClick={() => navigate('/subjects/new')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Propose Subject
              </Button>
            </div>
          }
        />

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700">Failed to load subjects.</CardContent>
          </Card>
        )}

        {!isLoading && !isError && subjects.length === 0 && (
          <div className="text-center py-20">
            <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-6">You haven't proposed any subjects yet</p>
            <Button onClick={() => navigate('/subjects/new')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Propose your first subject
            </Button>
          </div>
        )}

        {!isLoading && !isError && subjects.length > 0 && (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-slate-900 truncate">{subject.title}</p>
                    <SubjectStatusBadge status={subject.status} />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{subject.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Submitted {new Date(subject.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                  className="flex-shrink-0"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {canGenerateDraft && (
        <GenerateDraftSheet open={draftOpen} onOpenChange={setDraftOpen} />
      )}
    </div>
  );
};

export default MySubjects;
