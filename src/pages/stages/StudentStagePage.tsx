import { useNavigate } from 'react-router-dom';
import { useFetchMyStageQuery } from '@/redux/features/stages/stagesApi';
import StageBadge from '@/components/stages/StageBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GraduationCap, Mail, ListOrdered } from 'lucide-react';

const STATUS_BANNERS = {
  PENDING_ACAD: { bg: 'bg-orange-50 border-orange-300', text: 'text-orange-800', msg: 'En attente d\'un encadrant académique' },
  ACTIVE:       { bg: 'bg-green-50  border-green-300',  text: 'text-green-800',  msg: 'Stage en cours' },
  COMPLETED:    { bg: 'bg-blue-50   border-blue-300',   text: 'text-blue-800',   msg: 'Stage terminé' },
  CANCELLED:    { bg: 'bg-red-50    border-red-300',    text: 'text-red-800',    msg: 'Stage annulé' },
};

const SupervisorCard = ({
  label,
  user,
}: {
  label: string;
  user: { firstName: string; lastName: string; email: string } | null;
}) => (
  <div className="p-4 rounded-xl border border-slate-200 space-y-2">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
    {user ? (
      <>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
            <a href={`mailto:${user.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </a>
          </div>
        </div>
      </>
    ) : (
      <p className="text-sm text-slate-400 italic">Non encore assigné</p>
    )}
  </div>
);

const StudentStagePage = () => {
  const navigate = useNavigate();
  const { data: stage, isLoading, error } = useFetchMyStageQuery();

  // 404 = no stage yet — not a real error
  const noStage = !stage && (error as { status?: number })?.status === 404;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (noStage || !stage) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full border-slate-200">
          <CardContent className="p-10 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Votre stage n'a pas encore été créé</h2>
            <p className="text-slate-500 text-sm">
              Votre candidature est en cours de traitement. Vous serez notifié dès que votre stage sera créé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const banner = STATUS_BANNERS[stage.status];

  // Progress bar for ACTIVE stages
  const progress = (() => {
    if (stage.status !== 'ACTIVE' || !stage.startDate || !stage.endDate) return null;
    const start = new Date(stage.startDate).getTime();
    const end   = new Date(stage.endDate).getTime();
    const now   = Date.now();
    const pct   = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return Math.round(pct);
  })();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mon Stage</h1>
            <p className="text-slate-500 text-sm mt-1">Détails de votre stage en cours</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/stages/${stage.id}/jalons`)}
            aria-label="Voir les jalons et livrables"
          >
            <ListOrdered className="h-4 w-4 mr-2" aria-hidden />
            Jalons & livrables
          </Button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${banner.bg}`}>
          <StageBadge status={stage.status} />
          <p className={`text-sm font-medium ${banner.text}`}>{banner.msg}</p>
        </div>

        {/* Subject */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sujet de stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-slate-900 text-lg">{stage.subject.title}</p>
            {stage.subject.level && (
              <p className="text-sm text-slate-600">Niveau : {stage.subject.level}</p>
            )}
            {stage.subject.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stage.subject.technologies.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{t}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates + Progress */}
        {(stage.startDate || stage.endDate) && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Période de stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Début</p>
                  <p className="font-medium text-slate-900">
                    {stage.startDate ? new Date(stage.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="text-slate-300 text-lg">→</div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Fin</p>
                  <p className="font-medium text-slate-900">
                    {stage.endDate ? new Date(stage.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              {progress !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progression</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Supervisors */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Encadrants</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <SupervisorCard label="Encadrant Professionnel" user={stage.encadrantPro} />
            <SupervisorCard label="Encadrant Académique"    user={stage.encadrantAcad} />
          </CardContent>
        </Card>

        {/* Admin Notes (read-only) */}
        {stage.adminNotes && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{stage.adminNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentStagePage;
