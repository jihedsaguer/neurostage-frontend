import { useNavigate } from 'react-router-dom';
import { useFetchMySubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import { ArrowLeft, PlusCircle, Lightbulb, Eye } from 'lucide-react';

const MySubjects = () => {
  const navigate = useNavigate();
  const { data: subjects = [], isLoading, isError } = useFetchMySubjectsQuery({});

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">My Subjects</h1>
              <p className="text-slate-500 text-sm">All subjects you have proposed</p>
            </div>
          </div>
          <Button onClick={() => navigate('/subjects/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Propose Subject
          </Button>
        </div>

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
    </div>
  );
};

export default MySubjects;
