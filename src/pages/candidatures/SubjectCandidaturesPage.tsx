import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchSubjectByIdQuery } from '@/redux/features/subjects/subjectsApi';
import { useListSubjectCandidaturesQuery, useUpdateCandidatureStatusMutation } from '@/redux/features/canditatures/canditaturesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CandidatureList from '@/components/candidatures/CandidatureList';
import CandidatureStatusActions from '@/components/candidatures/CandidatureStatusActions';

const SubjectCandidaturesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: subject, isLoading: isSubjectLoading, isError: isSubjectError } = useFetchSubjectByIdQuery(id!);
  const {
    data: candidatures = [],
    isLoading: isCandidaturesLoading,
    error: candidaturesError,
    refetch,
  } = useListSubjectCandidaturesQuery(id!, { skip: !id });
  const [updateCandidatureStatus, { isLoading: isUpdating }] = useUpdateCandidatureStatusMutation();

  const counts = useMemo(() => {
    return {
      pending: candidatures.filter((item) => item.status === 'pending').length,
      accepted: candidatures.filter((item) => item.status === 'accepted').length,
      shortlisted: candidatures.filter((item) => item.status === 'shortlisted').length,
      rejected: candidatures.filter((item) => item.status === 'rejected').length,
    };
  }, [candidatures]);

  const handleStatusChange = async (candidatureId: string, status: 'accepted' | 'shortlisted' | 'rejected') => {
    try {
      await updateCandidatureStatus({ id: candidatureId, status }).unwrap();
      void refetch();
    } catch (error) {
      console.error('Unable to update candidature status', error);
    }
  };

  if (isSubjectLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-500">Loading candidatures...</p>
      </div>
    );
  }

  if (isSubjectError || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700 mb-4">Subject not found or you don't have permission to view candidatures.</p>
            <Button variant="outline" onClick={() => navigate('/subjects')}>
              Back to Subjects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Candidatures for {subject.title}</h1>
            <p className="text-sm text-slate-500">Review applications submitted for this subject.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/subjects/${subject.id}`)}>
              Back to Subject
            </Button>
            <Button size="sm" onClick={() => refetch()} disabled={isCandidaturesLoading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 bg-slate-50">
            <CardContent>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent>
              <p className="text-sm text-slate-500">Shortlisted</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.shortlisted}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent>
              <p className="text-sm text-slate-500">Accepted</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.accepted}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent>
              <p className="text-sm text-slate-500">Rejected</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>{candidatures.length} application{candidatures.length === 1 ? '' : 's'} submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {candidaturesError && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load applications.
              </div>
            )}

            {isCandidaturesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="h-28 rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm animate-pulse" />
                ))}
              </div>
            ) : candidatures.length > 0 ? (
              <CandidatureList
                candidatures={candidatures}
                actionArea={(candidature) => (
                  <CandidatureStatusActions
                    currentStatus={candidature.status}
                    loading={isUpdating}
                    onChange={(status) => void handleStatusChange(candidature.id, status)}
                  />
                )}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-slate-500">No applications have been submitted for this subject yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectCandidaturesPage;
