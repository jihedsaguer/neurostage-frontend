import { useParams, useNavigate } from 'react-router-dom';
import {
  useFetchSubjectByIdQuery,
  useDeleteSubjectMutation,
  useValidateSubjectMutation,
  useSubmitSubjectForReviewMutation,
} from '@/redux/features/subjects/subjectsApi';
import { useAppSelector } from '@/redux/hooks';
import { useApplyToSubjectMutation, useListMyCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/ui/PageHeader';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import ApplyToSubjectModal from '@/components/candidatures/ApplyToSubjectModal';
import {
  ArrowLeft, Edit, Trash2, Calendar, User, Users, CheckCircle,
  XCircle, Send, BookLock, AlertTriangle, Layers, GraduationCap,
  Code2, ClipboardCheck, Clock,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// ─── Subject Unavailable Empty State ─────────────────────────────────────────

const SubjectUnavailableState = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
        <BookLock className="h-10 w-10 text-amber-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Subject No Longer Available</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          This internship subject has already been assigned to another student and is no longer
          available for new applications.
        </p>
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-left">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Why is this happening?</p>
            <p className="text-xs text-amber-700 mt-1">
              Once a candidature is accepted and an internship is officially created, the subject
              is automatically removed from the catalogue to prevent duplicate assignments.
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalogue
        </Button>
        <Button onClick={() => window.location.replace('/subjects')}>
          Browse Other Subjects
        </Button>
      </div>
    </div>
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const SubjectDetailSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// ─── Tech Badge ───────────────────────────────────────────────────────────────

const TechBadge = ({ tech }: { tech: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
    <Code2 className="h-3 w-3" />
    {tech}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);

  const { data: subject, isLoading, isError, error } = useFetchSubjectByIdQuery(id!, { skip: !id });
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();
  const [validateSubject, { isLoading: isValidating }] = useValidateSubjectMutation();
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitSubjectForReviewMutation();
  const { data: myCandidatures = [], isLoading: isCandidaturesLoading } = useListMyCandidaturesQuery(undefined, {
    skip: role !== 'student',
  });
  const [applyToSubject, { isLoading: isApplying }] = useApplyToSubjectMutation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [pendingValidationStatus, setPendingValidationStatus] = useState<'VALIDATED' | 'REJECTED' | null>(null);
  const [motivation, setMotivation] = useState('');
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const hasApplied = useMemo(
    () => myCandidatures.some((c) => c.subject.id === subject?.id),
    [myCandidatures, subject?.id]
  );

  // Guard: invalid ID
  if (!id || id === ':id') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700 mb-4">Invalid subject identifier.</p>
            <Button onClick={() => navigate('/subjects')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <SubjectDetailSkeleton />;

  // Handle 403 (subject no longer available after stage creation) and 404 gracefully
  if (isError) {
    const status = (error as any)?.status;
    if (status === 403 || status === 404 || status === 400) {
      return <SubjectUnavailableState onBack={() => navigate('/subjects')} />;
    }
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium mb-1">Could not load subject</p>
              <p className="text-red-600 text-sm mb-4">There was an error loading this subject. Please try again.</p>
              <Button onClick={() => navigate('/subjects')} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subjects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subject) return <SubjectUnavailableState onBack={() => navigate('/subjects')} />;

  const isOwner = currentUser?.id === subject.createdBy.id;
  const isAdmin = role === 'super_admin' || role === 'admin_formation';
  const canEdit   = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canSubmitForReview = isOwner && subject.status === 'DRAFT';
  const canValidate = isAdmin && subject.status === 'PENDING';
  const canAdminSubmit = isAdmin && subject.status === 'DRAFT';

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSubject(id).unwrap();
      toast.success('Subject deleted successfully');
      navigate('/subjects', { replace: true });
    } catch {
      toast.error('Failed to delete subject. Please try again.');
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) return;
    try {
      await submitForReview(id).unwrap();
      toast.success('Subject submitted for review. An admin will validate it shortly.');
    } catch {
      toast.error('Failed to submit subject for review. Please try again.');
    }
  };

  const handleValidate = async () => {
    if (!id || !pendingValidationStatus) return;
    try {
      await validateSubject({ id, data: { status: pendingValidationStatus } }).unwrap();
      setShowValidateModal(false);
      setPendingValidationStatus(null);
      toast.success(
        pendingValidationStatus === 'VALIDATED'
          ? 'Subject approved and published to students.'
          : 'Subject rejected and returned to draft.'
      );
    } catch {
      toast.error('Failed to process validation. Please try again.');
    }
  };

  const handleApply = async () => {
    if (!subject?.id) return;
    if (!motivation.trim()) {
      setApplicationError('Please enter a motivation for your candidature.');
      return;
    }
    try {
      setApplicationError(null);
      await applyToSubject({ subjectId: subject.id, motivation: motivation.trim() }).unwrap();
      setShowApplyModal(false);
      setMotivation('');
      toast.success('Application submitted! The encadrant will review it shortly.', {
        description: `Applied to: ${subject.title}`,
      });
    } catch (err: unknown) {
      const errObj = err as { status?: number; data?: { message?: string } };
      // Business exception: subject already assigned (400/409)
      if (errObj?.status === 400 || errObj?.status === 409) {
        const msg = errObj?.data?.message ?? 'This subject is no longer available for applications.';
        // If subject is taken, close modal and show unavailable state hint
        if (msg.toLowerCase().includes('assign') || msg.toLowerCase().includes('stage')) {
          setShowApplyModal(false);
          toast.error('Subject No Longer Available', {
            description: 'This internship subject has already been assigned to another student.',
            duration: 6000,
          });
        } else {
          setApplicationError(msg);
        }
      } else if (errObj?.status === 422) {
        setApplicationError('You have already applied to this subject.');
      } else {
        setApplicationError('Unable to submit application. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <PageHeader
          title={subject.title}
          subtitle="Detailed view of this internship subject"
          backTo="/subjects"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/subjects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to catalogue
            </Button>
          }
        />

        {/* Main card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <CardTitle className="text-2xl font-semibold text-slate-900">{subject.title}</CardTitle>
                  <SubjectStatusBadge status={subject.status} />
                  {subject.level && (
                    <Badge variant="outline" className="font-normal text-slate-600 border-slate-300">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {subject.level}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      {subject.createdBy.firstName} {subject.createdBy.lastName}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      {new Date(subject.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </span>
                </CardDescription>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/subjects/${id}/candidatures`)}>
                      <Users className="h-4 w-4 mr-1.5" />
                      Applications
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/subjects/${id}/edit`)}>
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                  </>
                )}

                {canSubmitForReview && (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-1.5 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1.5" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                )}

                {canAdminSubmit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting…' : 'Move to Pending'}
                  </Button>
                )}

                {canValidate && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setShowValidateModal(true)}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1.5" />
                    Review
                  </Button>
                )}

                {/* Student Apply section */}
                {role === 'student' && subject.status === 'VALIDATED' && (
                  hasApplied ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/candidatures/my')}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      View My Application
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowApplyModal(true)}
                      disabled={isApplying || isCandidaturesLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply Now
                    </Button>
                  )
                )}

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 border-t border-slate-100 pt-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{subject.description}</p>
            </div>

            {/* Technologies */}
            {subject.technologies.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subject.technologies.map((tech, idx) => (
                    <TechBadge key={idx} tech={tech} />
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {subject.prerequisites && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Prerequisites</h3>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{subject.prerequisites}</p>
              </div>
            )}

            {/* Contact */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Supervisor</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {subject.createdBy.firstName?.[0]}{subject.createdBy.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {subject.createdBy.firstName} {subject.createdBy.lastName}
                  </p>
                  <a
                    href={`mailto:${(subject.createdBy as any).email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {(subject.createdBy as any).email}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full shadow-2xl border-0">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Delete Subject</CardTitle>
                </div>
                <CardDescription className="pl-13">
                  Are you sure you want to permanently delete <strong>"{subject.title}"</strong>?
                  This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Validate Subject Modal */}
        {showValidateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full shadow-2xl border-0">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Review Subject</CardTitle>
                </div>
                <CardDescription>
                  Choose an action for <strong>"{subject.title}"</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pendingValidationStatus ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowValidateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setPendingValidationStatus('REJECTED')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => setPendingValidationStatus('VALIDATED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className={`rounded-lg p-4 ${pendingValidationStatus === 'VALIDATED' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-sm text-slate-700">
                        Confirm{' '}
                        <strong className={pendingValidationStatus === 'VALIDATED' ? 'text-emerald-700' : 'text-red-700'}>
                          {pendingValidationStatus === 'VALIDATED' ? 'approval' : 'rejection'}
                        </strong>{' '}
                        of this subject?
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPendingValidationStatus(null)}
                        disabled={isValidating}
                      >
                        Back
                      </Button>
                      <Button
                        variant={pendingValidationStatus === 'REJECTED' ? 'destructive' : 'default'}
                        className={`flex-1 ${pendingValidationStatus === 'VALIDATED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={handleValidate}
                        disabled={isValidating}
                      >
                        {isValidating
                          ? 'Processing...'
                          : `Confirm ${pendingValidationStatus === 'VALIDATED' ? 'Approval' : 'Rejection'}`}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <ApplyToSubjectModal
          open={showApplyModal}
          motivation={motivation}
          isSubmitting={isApplying}
          error={applicationError}
          onClose={() => {
            setShowApplyModal(false);
            setApplicationError(null);
            setMotivation('');
          }}
          onChange={setMotivation}
          onSubmit={handleApply}
        />
      </div>
    </div>
  );
};

export default SubjectDetail;
