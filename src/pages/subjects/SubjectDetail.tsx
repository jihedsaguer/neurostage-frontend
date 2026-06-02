import { useParams, useNavigate } from 'react-router-dom';
import { useFetchSubjectByIdQuery, useDeleteSubjectMutation, useValidateSubjectMutation } from '@/redux/features/subjects/subjectsApi';
import { useAppSelector } from '@/redux/hooks';
import { useApplyToSubjectMutation, useListMyCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import ApplyToSubjectModal from '@/components/candidatures/ApplyToSubjectModal';
import { ArrowLeft, Edit, Trash2, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  
  const { data: subject, isLoading, isError } = useFetchSubjectByIdQuery(id!);
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();
  const [validateSubject, { isLoading: isValidating }] = useValidateSubjectMutation();
  const { data: myCandidatures = [], isLoading: isCandidaturesLoading } = useListMyCandidaturesQuery(undefined, {
    skip: role !== 'student',
  });
  const [applyToSubject, { isLoading: isApplying }] = useApplyToSubjectMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'VALIDATED' | 'REJECTED' | null>(null);
  const [motivation, setMotivation] = useState('');
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const hasApplied = useMemo(
    () => myCandidatures.some((candidature) => candidature.subject.id === subject?.id),
    [myCandidatures, subject?.id]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-500">Loading subject...</p>
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700 mb-4">Subject not found or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/subjects')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = currentUser?.id === subject.createdBy.id;
  const isAdmin = role === 'super_admin' || role === 'admin_formation';
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSubject(id).unwrap();
      navigate('/subjects', { replace: true });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleValidate = async () => {
    if (!id || !validationStatus) return;
    try {
      await validateSubject({ id, data: { status: validationStatus } }).unwrap();
      setShowValidateModal(false);
      setValidationStatus(null);
    } catch (error) {
      console.error('Validation failed:', error);
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
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'data' in error
          ? JSON.stringify((error as any).data)
          : 'Unable to submit candidature. Please try again.';
      setApplicationError(String(message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          onClick={() => navigate('/subjects')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subjects
        </Button>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{subject.title}</CardTitle>
                  <SubjectStatusBadge status={subject.status} />
                </div>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {subject.createdBy.firstName} {subject.createdBy.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(subject.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/subjects/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {isAdmin && subject.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowValidateModal(true)}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validate
                  </Button>
                )}
                {role === 'student' && subject.status === 'VALIDATED' && (
                  hasApplied ? (
                    <Button variant="outline" size="sm" onClick={() => navigate('/candidatures/my')}>
                      View Application
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowApplyModal(true)}
                      disabled={isApplying || isCandidaturesLoading}
                    >
                      Apply
                    </Button>
                  )
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{subject.description}</p>
            </div>

            {/* Technologies */}
            {subject.technologies.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {subject.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Level */}
            {subject.level && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Level</h3>
                <p className="text-slate-700">{subject.level}</p>
              </div>
            )}

            {/* Prerequisites */}
            {subject.prerequisites && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Prerequisites</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{subject.prerequisites}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-slate-900 mb-2">Contact</h3>
              <p className="text-slate-700">
                {subject.createdBy.firstName} {subject.createdBy.lastName}
                <br />
                <a href={`mailto:${subject.createdBy.email}`} className="text-blue-600 hover:underline">
                  {subject.createdBy.email}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Delete Subject</CardTitle>
                <CardDescription>
                  Are you sure you want to delete "{subject.title}"? This action cannot be undone.
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
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Validate Subject Modal */}
        {showValidateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Validate Subject</CardTitle>
                <CardDescription>
                  Choose an action for "{subject.title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowValidateModal(false)}
                    className="flex-1"
                    disabled={isValidating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setValidationStatus('REJECTED')}
                    className="flex-1"
                    disabled={isValidating || validationStatus === 'REJECTED'}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setValidationStatus('VALIDATED')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isValidating || validationStatus === 'VALIDATED'}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
                {validationStatus && (
                  <Button
                    onClick={handleValidate}
                    disabled={isValidating || !validationStatus}
                    className="w-full"
                  >
                    {isValidating ? 'Processing...' : `Confirm ${validationStatus}`}
                  </Button>
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
