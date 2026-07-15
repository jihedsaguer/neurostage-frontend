import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchMyStagesAsAcadQuery } from '@/redux/features/stages/stagesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import StageBadge from '@/components/stages/StageBadge';
import type { Stage, StageStatus } from '@/types/stage.types';
import { STAGE_STATUS_LABELS } from '@/types/stage.types';
import { Search, Loader2, FolderOpen } from 'lucide-react';

const STATUS_OPTIONS: Array<{ value: StageStatus | ''; label: string }> = [
  { value: '',             label: 'Tous les statuts' },
  { value: 'PENDING_ACAD', label: STAGE_STATUS_LABELS.PENDING_ACAD },
  { value: 'ACTIVE',       label: STAGE_STATUS_LABELS.ACTIVE },
  { value: 'COMPLETED',    label: STAGE_STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED',    label: STAGE_STATUS_LABELS.CANCELLED },
];

const AcadStagesPage = () => {
  const navigate = useNavigate();
  const { data: stages = [], isLoading, isError, refetch } = useFetchMyStagesAsAcadQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StageStatus | ''>('');

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

  const stats = useMemo(
    () => ({
      total: stages.length,
      pendingAcad: stages.filter((s) => s.status === 'PENDING_ACAD').length,
      active: stages.filter((s) => s.status === 'ACTIVE').length,
      completed: stages.filter((s) => s.status === 'COMPLETED').length,
      cancelled: stages.filter((s) => s.status === 'CANCELLED').length,
    }),
    [stages]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes Stages Tutorés</h1>
          <p className="text-slate-500 text-sm mt-1">Stages où vous êtes encadrant académique</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-800' },
            { label: 'En attente', value: stats.pendingAcad, color: 'bg-orange-100 text-orange-800' },
            { label: 'Actifs', value: stats.active, color: 'bg-green-100 text-green-800' },
            { label: 'Terminés', value: stats.completed, color: 'bg-blue-100 text-blue-800' },
            { label: 'Annulés', value: stats.cancelled, color: 'bg-red-100 text-red-800' },
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
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
              <Button variant="outline" onClick={() => refetch()}>
                Réessayer
              </Button>
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
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Début / Fin</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((stage: Stage) => (
                    <tr key={stage.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {stage.student.firstName} {stage.student.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={stage.subject.title}>
                        {stage.subject.title}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/stages/${stage.id}/jalons`)}
                            aria-label="Jalons et livrables"
                          >
                            Jalons
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/stages/${stage.id}`)}
                          >
                            Détails
                          </Button>
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
    </div>
  );
};

export default AcadStagesPage;
