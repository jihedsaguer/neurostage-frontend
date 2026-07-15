import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchAllStagesQuery, useCancelStageMutation } from '@/redux/features/stages/stagesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StageBadge from '@/components/stages/StageBadge';
import EditStageModal from '@/components/stages/EditStageModal';
import CreateStageModal from '@/components/stages/CreateStageModal';
import type { Stage, StageStatus } from '@/types/stage.types';
import { STAGE_STATUS_LABELS } from '@/types/stage.types';
import { Plus, Search, Loader2, FolderOpen } from 'lucide-react';

const STATUS_OPTIONS: Array<{ value: StageStatus | ''; label: string }> = [
  { value: '',             label: 'Tous les statuts' },
  { value: 'PENDING_ACAD', label: STAGE_STATUS_LABELS.PENDING_ACAD },
  { value: 'ACTIVE',       label: STAGE_STATUS_LABELS.ACTIVE },
  { value: 'COMPLETED',    label: STAGE_STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED',    label: STAGE_STATUS_LABELS.CANCELLED },
];

const AdminStagesPage = () => {
  const navigate = useNavigate();
  const { data: stages = [], isLoading, isError, refetch } = useFetchAllStagesQuery();
  const [cancelStage, { isLoading: cancelling }] = useCancelStageMutation();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<StageStatus | ''>('');
  const [editTarget, setEditTarget]   = useState<Stage | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Stage | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stages.filter((s) => {
      const matchSearch =
        !q ||
        `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(q) ||
        s.subject.title.toLowerCase().includes(q);
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stages, search, statusFilter]);

  const stats = useMemo(() => ({
    total:       stages.length,
    pendingAcad: stages.filter((s) => s.status === 'PENDING_ACAD').length,
    active:      stages.filter((s) => s.status === 'ACTIVE').length,
    completed:   stages.filter((s) => s.status === 'COMPLETED').length,
    cancelled:   stages.filter((s) => s.status === 'CANCELLED').length,
  }), [stages]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelStage(cancelTarget.id).unwrap();
      setCancelTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des Stages</h1>
            <p className="text-slate-500 text-sm">Gérez tous les stages de la plateforme</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un stage
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total',       value: stats.total,       color: 'bg-slate-100 text-slate-800' },
            { label: 'En attente',  value: stats.pendingAcad, color: 'bg-orange-100 text-orange-800' },
            { label: 'Actifs',      value: stats.active,      color: 'bg-green-100 text-green-800' },
            { label: 'Terminés',    value: stats.completed,   color: 'bg-blue-100 text-blue-800' },
            { label: 'Annulés',     value: stats.cancelled,   color: 'bg-red-100 text-red-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${color}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par étudiant ou sujet…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StageStatus | '')}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <Card className="border-slate-200 overflow-hidden">
          {isLoading ? (
            <CardContent className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              Chargement des stages…
            </CardContent>
          ) : isError ? (
            <CardContent className="py-10 text-center">
              <p className="text-red-600 mb-3">Erreur lors du chargement</p>
              <Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
            </CardContent>
          ) : filtered.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FolderOpen className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucun stage trouvé</p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-medium">Étudiant</th>
                    <th className="px-4 py-3 font-medium">Sujet</th>
                    <th className="px-4 py-3 font-medium">Enc. Pro</th>
                    <th className="px-4 py-3 font-medium">Enc. Acad</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Début / Fin</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((stage) => (
                    <tr key={stage.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {stage.student.firstName} {stage.student.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={stage.subject.title}>
                        {stage.subject.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {stage.encadrantPro.firstName} {stage.encadrantPro.lastName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {stage.encadrantAcad ? (
                          <span className="text-slate-600">
                            {stage.encadrantAcad.firstName} {stage.encadrantAcad.lastName}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge status={stage.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {stage.startDate ? new Date(stage.startDate).toLocaleDateString('fr-FR') : '—'}
                        {' / '}
                        {stage.endDate ? new Date(stage.endDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/stages/${stage.id}/jalons`)}>
                            Jalons
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/stages/${stage.id}`)}>
                            Voir
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditTarget(stage)}>
                            Modifier
                          </Button>
                          {stage.status !== 'CANCELLED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setCancelTarget(stage)}
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditStageModal
          stage={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateStageModal onClose={() => setShowCreate(false)} />
      )}

      {/* Cancel Confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle>Annuler le stage</CardTitle>
              <CardDescription>
                Êtes-vous sûr de vouloir annuler le stage de{' '}
                <strong>{cancelTarget.student.firstName} {cancelTarget.student.lastName}</strong> ?
                Cette action ne peut pas être annulée.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)} disabled={cancelling}>
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

export default AdminStagesPage;
