import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useFetchSubjectsQuery,
  useValidateSubjectMutation,
  useSubmitSubjectForReviewMutation,
} from '@/redux/features/subjects/subjectsApi';
import type { Subject } from '@/types/subject.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AdminDashboardContent } from '@/components/dashboard/AdminDashboardContent';

const FormationDashboardPage = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'VALIDATED' | 'REJECTED' | null>(null);

  // Fetch both PENDING and DRAFT subjects that need attention
  const { data: pendingData, isLoading: isPendingLoading, isError: isPendingError } =
    useFetchSubjectsQuery({ status: 'PENDING', limit: 50 });
  const { data: draftData, isLoading: isDraftLoading, isError: isDraftError } =
    useFetchSubjectsQuery({ status: 'DRAFT', limit: 50 });

  const [validateSubject, { isLoading: isValidating }] = useValidateSubjectMutation();
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitSubjectForReviewMutation();

  const pendingSubjects = pendingData?.data ?? [];
  const draftSubjects   = draftData?.data ?? [];
  // Show PENDING first (ready to validate), then DRAFT (needs submission first)
  const reviewableSubjects = [...pendingSubjects, ...draftSubjects].slice(0, 6);
  const isLoading = isPendingLoading || isDraftLoading;
  const isError   = isPendingError   || isDraftError;

  const openValidateModal = (subject: Subject, status: 'VALIDATED' | 'REJECTED') => {
    setSelectedSubject(subject);
    setValidationStatus(status);
    setShowValidateModal(true);
  };

  const closeValidateModal = () => {
    setSelectedSubject(null);
    setValidationStatus(null);
    setShowValidateModal(false);
  };

  const handleValidate = async () => {
    if (!selectedSubject || !validationStatus) return;
    try {
      await validateSubject({ id: selectedSubject.id, data: { status: validationStatus } }).unwrap();
      closeValidateModal();
    } catch (error) {
      console.error('Subject validation failed:', error);
    }
  };

  const handleSubmitForReview = async (subject: Subject) => {
    try {
      await submitForReview(subject.id).unwrap();
    } catch (error) {
      console.error('Submit for review failed:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Formation Dashboard" 
      subtitle="Manage formations, subjects, and training programs"
      brandName="Formation Portal"
    >
      <div className="p-6 space-y-6">
        <AdminDashboardContent />

        {/* Subjects Awaiting Action */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Subjects Awaiting Action</CardTitle>
              <CardDescription className="mt-1">
                PENDING subjects are ready to approve or reject. DRAFT subjects need to be submitted first.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/subjects')}
              className="gap-1 flex-shrink-0"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-sm text-slate-500 py-8 text-center">Loading subjects…</div>
            ) : isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Unable to load subjects. Please refresh the page.
              </div>
            ) : reviewableSubjects.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-slate-600">Nothing to review</p>
                <p className="text-xs text-slate-500 mt-1">All subjects are up to date</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviewableSubjects.map((subject) => {
                  const isDraft = subject.status === 'DRAFT';
                  return (
                    <div
                      key={subject.id}
                      className={`rounded-lg border p-4 hover:shadow-md transition-shadow ${
                        isDraft ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {subject.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            By {subject.createdBy.firstName} {subject.createdBy.lastName}
                          </p>
                        </div>
                        <SubjectStatusBadge status={subject.status} />
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {subject.description}
                      </p>

                      {isDraft ? (
                        /* DRAFT: admin can push it to PENDING on behalf of the creator */
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/subjects/${subject.id}`)}
                            className="flex-1 text-xs h-8"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitForReview(subject)}
                          >
                            {isSubmitting ? 'Submitting…' : 'Submit for Review'}
                          </Button>
                        </div>
                      ) : (
                        /* PENDING: ready to approve or reject */
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/subjects/${subject.id}`)}
                            className="flex-1 text-xs h-8"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => openValidateModal(subject, 'VALIDATED')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={() => openValidateModal(subject, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validation Modal */}
        {showValidateModal && selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-xl">
              <CardHeader>
                <CardTitle>Review subject</CardTitle>
                <CardDescription>
                  Confirm {validationStatus?.toLowerCase()} for "{selectedSubject.title}".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  This subject will be updated to <strong>{validationStatus}</strong>.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={closeValidateModal}
                    disabled={isValidating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={validationStatus === 'REJECTED' ? 'destructive' : 'secondary'}
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="flex-1"
                  >
                    {isValidating ? 'Processing…' : `Confirm ${validationStatus}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FormationDashboardPage;
