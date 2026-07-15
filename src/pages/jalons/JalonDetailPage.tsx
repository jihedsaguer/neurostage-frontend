import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import {
  useFetchJalonByIdQuery,
  useDeleteJalonMutation,
} from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import JalonStatusBadge from '@/components/jalons/JalonStatusBadge';
import EditJalonModal from '@/components/jalons/EditJalonModal';
import SubmitLivrablePanel from '@/components/jalons/SubmitLivrablePanel';
import ValidateJalonPanel from '@/components/jalons/ValidateJalonPanel';
import AcadCommentPanel from '@/components/jalons/AcadCommentPanel';
import { SYSTEM_ROLES } from '@/types/jalon.types';
import type { RoleName } from '@/types/user';
import { formatFileSize } from '@/lib/jalonUtils';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';
import { Loader2, Download, ShieldCheck, ShieldAlert, Trash2, Pencil } from 'lucide-react';

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
    <span className="text-sm text-slate-900">{value ?? '—'}</span>
  </div>
);

const JalonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.role) as RoleName | null;

  const { data: jalon, isLoading, isError, refetch } = useFetchJalonByIdQuery(id!, { skip: !id });
  const [deleteJalon, { isLoading: deleting }] = useDeleteJalonMutation();

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isAdmin =
    role === SYSTEM_ROLES.SUPER_ADMIN || role === SYSTEM_ROLES.ADMIN_FORMATION;
  const isStudent = role === SYSTEM_ROLES.STUDENT;
  const isPro = role === SYSTEM_ROLES.ENCADRANT_PRO;
  const isAcad = role === SYSTEM_ROLES.ENCADRANT_ACADEMIQUE;

  const canSubmitLivrable =
    isStudent && jalon && (jalon.status === 'PENDING' || jalon.status === 'REJECTED');
  const canValidate = isPro && jalon?.status === 'SUBMITTED';
  const canDelete = isAdmin && jalon?.status === 'PENDING';

  const listPath = jalon ? `/stages/${jalon.stageId}/jalons` : '/';

  const handleDelete = async () => {
    if (!jalon || !id) return;
    setDeleteError('');
    try {
      await deleteJalon({ id, stageId: jalon.stageId }).unwrap();
      setShowDeleteModal(false);
      navigate(listPath);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, 'Impossible de supprimer ce jalon.'));
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">Identifiant de jalon manquant.</CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="Chargement" />
      </div>
    );
  }

  if (isError || !jalon) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700 flex flex-col gap-3">
              <span>Jalon introuvable.</span>
              <Button variant="outline" onClick={() => refetch()} aria-label="Réessayer">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const livrable = jalon.livrable;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title={jalon.label}
          subtitle={jalon.description ?? undefined}
          backTo={listPath}
          backLabel="Retour aux jalons"
          actions={
            isAdmin ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowEdit(true)} aria-label="Modifier le jalon">
                  <Pencil className="h-4 w-4 mr-2" aria-hidden />
                  Modifier
                </Button>
                <span
                  title={canDelete ? 'Supprimer ce jalon' : 'Suppression possible uniquement si le statut est En attente'}
                  className="inline-flex"
                >
                  <Button
                    variant="destructive"
                    disabled={!canDelete}
                    onClick={() => canDelete && setShowDeleteModal(true)}
                    aria-label="Supprimer le jalon"
                    aria-disabled={!canDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" aria-hidden />
                    Supprimer
                  </Button>
                </span>
              </div>
            ) : undefined
          }
        />

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-base">Informations</CardTitle>
              <JalonStatusBadge status={jalon.status} />
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="Ordre" value={jalon.order} />
            <InfoRow
              label="Échéance"
              value={jalon.dueDate ? new Date(jalon.dueDate).toLocaleDateString('fr-FR') : '—'}
            />
            {jalon.description && (
              <div className="sm:col-span-2">
                <InfoRow label="Description" value={<span className="whitespace-pre-wrap">{jalon.description}</span>} />
              </div>
            )}
            {jalon.validatedBy && (
              <InfoRow
                label="Validé par"
                value={`${jalon.validatedBy.firstName} ${jalon.validatedBy.lastName}`}
              />
            )}
            {jalon.validatedAt && (
              <InfoRow
                label="Validé le"
                value={new Date(jalon.validatedAt).toLocaleString('fr-FR')}
              />
            )}
            {jalon.proComment && (
              <div className="sm:col-span-2">
                <InfoRow label="Commentaire pro" value={<span className="whitespace-pre-wrap">{jalon.proComment}</span>} />
              </div>
            )}
            {jalon.acadComment && (
              <div className="sm:col-span-2">
                <InfoRow label="Commentaire académique" value={<span className="whitespace-pre-wrap">{jalon.acadComment}</span>} />
              </div>
            )}
          </CardContent>
        </Card>

        {livrable && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Livrable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRow label="Fichier" value={livrable.fileName} />
                <InfoRow label="Type" value={livrable.fileType} />
                <InfoRow label="Taille" value={formatFileSize(livrable.size)} />
                <InfoRow
                  label="Soumis le"
                  value={new Date(livrable.submittedAt).toLocaleString('fr-FR')}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Scan antivirus</span>
                {livrable.scanOk ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                    role="status"
                    aria-label="Scan antivirus : OK"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    OK
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800"
                    role="status"
                    aria-label="Scan antivirus : en attente ou échec"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                    Non vérifié
                  </span>
                )}
              </div>

              {livrable.studentNote && (
                <InfoRow label="Note étudiant" value={<span className="whitespace-pre-wrap">{livrable.studentNote}</span>} />
              )}

              <a
                href={livrable.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
                aria-label={`Télécharger ${livrable.fileName}`}
              >
                <Download className="h-4 w-4 mr-1" aria-hidden />
                Télécharger le fichier
              </a>
            </CardContent>
          </Card>
        )}

        {canSubmitLivrable && <SubmitLivrablePanel jalonId={jalon.id} />}
        {canValidate && <ValidateJalonPanel jalonId={jalon.id} />}
        {isAcad && <AcadCommentPanel jalonId={jalon.id} initialComment={jalon.acadComment} />}
      </div>

      {showEdit && <EditJalonModal jalon={jalon} onClose={() => setShowEdit(false)} />}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle>Supprimer le jalon</CardTitle>
              <CardDescription>
                Supprimer définitivement « {jalon.label} » ? Cette action n’est possible que pour un jalon en attente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                  Annuler
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting} aria-label="Confirmer la suppression">
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
                  Confirmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JalonDetailPage;
