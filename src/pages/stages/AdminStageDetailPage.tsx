import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useFetchStageByIdQuery,
  useUpdateStageMutation,
  useCancelStageMutation,
} from '@/redux/features/stages/stagesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StageBadge from '@/components/stages/StageBadge';
import EditStageModal from '@/components/stages/EditStageModal';
import AssignModal from '@/components/stages/AssignModal';
import { ArrowLeft, Loader2, UserPlus, AlertTriangle, ListOrdered } from 'lucide-react';

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
    <span className="text-sm text-slate-900">{value || '—'}</span>
  </div>
);

const AdminStageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: stage, isLoading, isError } = useFetchStageByIdQuery(id!);
  const [updateStage, { isLoading: savingNotes }] = useUpdateStageMutation();
  const [cancelStage, { isLoading: cancelling }]  = useCancelStageMutation();

  const [showEdit,        setShowEdit]        = useState(false);
  const [showAssignPro,   setShowAssignPro]   = useState(false);
  const [showAssignAcad,  setShowAssignAcad]  = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes,           setNotes]           = useState('');
  const [notesSaved,      setNotesSaved]      = useState(false);

  // Sync notes when stage loads
  if (stage && notes === '' && stage.adminNotes) {
    setNotes(stage.adminNotes);
  }

  const handleSaveNotes = async () => {
    if (!id) return;
    await updateStage({ id, payload: { adminNotes: notes } }).unwrap();
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleCancel = async () => {
    if (!id) return;
    await cancelStage(id).unwrap();
    setShowCancelModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !stage) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700 mb-4">Stage introuvable.</p>
            <Button variant="outline" onClick={() => navigate('/admin/stages')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/stages')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900">{stage.subject.title}</h1>
              <StageBadge status={stage.status} />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {stage.startDate ? new Date(stage.startDate).toLocaleDateString('fr-FR') : '—'}
              {' → '}
              {stage.endDate ? new Date(stage.endDate).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/stages/${id}/jalons`)} aria-label="Voir les jalons du stage">
              <ListOrdered className="h-4 w-4 mr-2" aria-hidden />
              Jalons & livrables
            </Button>
            <Button variant="outline" onClick={() => setShowEdit(true)}>Modifier</Button>
          </div>
        </div>

        {/* Student + Subject */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Étudiant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Nom" value={`${stage.student.firstName} ${stage.student.lastName}`} />
              <InfoRow label="Email" value={<a href={`mailto:${stage.student.email}`} className="text-blue-600 hover:underline">{stage.student.email}</a>} />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sujet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Titre" value={stage.subject.title} />
              <InfoRow label="Niveau" value={stage.subject.level} />
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Technologies</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {stage.subject.technologies.length > 0
                    ? stage.subject.technologies.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{t}</span>
                      ))
                    : <span className="text-sm text-slate-400">—</span>
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supervisors */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Encadrants</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {/* Encadrant Pro */}
            <div className="p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Encadrant Pro</span>
                <Button size="sm" variant="outline" onClick={() => setShowAssignPro(true)}>
                  Réassigner
                </Button>
              </div>
              <p className="font-medium text-slate-900">{stage.encadrantPro.firstName} {stage.encadrantPro.lastName}</p>
              <p className="text-sm text-slate-500">{stage.encadrantPro.email}</p>
            </div>

            {/* Encadrant Acad */}
            <div className={`p-4 rounded-lg border space-y-2 ${stage.encadrantAcad ? 'border-slate-200' : 'border-orange-300 bg-orange-50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Encadrant Académique</span>
                <Button
                  size="sm"
                  variant={stage.encadrantAcad ? 'outline' : 'default'}
                  onClick={() => setShowAssignAcad(true)}
                >
                  {stage.encadrantAcad ? 'Réassigner' : (
                    <><UserPlus className="h-4 w-4 mr-1" />Assigner</>
                  )}
                </Button>
              </div>
              {stage.encadrantAcad ? (
                <>
                  <p className="font-medium text-slate-900">{stage.encadrantAcad.firstName} {stage.encadrantAcad.lastName}</p>
                  <p className="text-sm text-slate-500">{stage.encadrantAcad.email}</p>
                </>
              ) : (
                <p className="text-sm text-orange-700 font-medium">Non encore assigné — stage en attente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ajouter des notes internes…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
              {notesSaved && <span className="text-sm text-green-600">✓ Enregistré</span>}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {stage.status !== 'CANCELLED' && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Zone dangereuse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                L'annulation du stage est irréversible. L'étudiant et les encadrants seront notifiés.
              </p>
              <Button variant="destructive" onClick={() => setShowCancelModal(true)}>
                Annuler le stage
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showEdit && <EditStageModal stage={stage} onClose={() => setShowEdit(false)} />}
      {showAssignPro  && <AssignModal stageId={stage.id} mode="pro"  onClose={() => setShowAssignPro(false)} />}
      {showAssignAcad && <AssignModal stageId={stage.id} mode="acad" onClose={() => setShowAssignAcad(false)} />}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle>Confirmer l'annulation</CardTitle>
              <CardDescription>
                Cette action annulera définitivement le stage de{' '}
                <strong>{stage.student.firstName} {stage.student.lastName}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
                Retour
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={cancelling}>
                {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminStageDetailPage;
