import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useFetchJalonsByStageIdQuery } from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import JalonStatusBadge from '@/components/jalons/JalonStatusBadge';
import CreateJalonModal from '@/components/jalons/CreateJalonModal';
import { SYSTEM_ROLES } from '@/types/jalon.types';
import type { JalonResponse } from '@/types/jalon.types';
import type { RoleName } from '@/types/user';
import { Plus, Loader2, FolderOpen, ListOrdered } from 'lucide-react';

const JalonsListPage = () => {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.role) as RoleName | null;

  const { data: jalons = [], isLoading, isError, refetch } = useFetchJalonsByStageIdQuery(stageId!, {
    skip: !stageId,
  });

  const [showCreate, setShowCreate] = useState(false);

  const sorted = useMemo(
    () => [...jalons].sort((a, b) => a.order - b.order),
    [jalons]
  );

  const isAdmin =
    role === SYSTEM_ROLES.SUPER_ADMIN || role === SYSTEM_ROLES.ADMIN_FORMATION;

  const backTo =
    role === SYSTEM_ROLES.STUDENT
      ? '/student/stage'
      : role === SYSTEM_ROLES.SUPER_ADMIN || role === SYSTEM_ROLES.ADMIN_FORMATION
        ? `/admin/stages/${stageId}`
        : role === SYSTEM_ROLES.ENCADRANT_PRO
          ? '/pro/stages'
          : role === SYSTEM_ROLES.ENCADRANT_ACADEMIQUE
            ? '/acad/stages'
            : '/';

  const openDetail = (j: JalonResponse) => {
    navigate(`/jalons/${j.id}`);
  };

  if (!stageId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">Identifiant de stage manquant.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Jalons & livrables"
          subtitle="Échéances et livrables associés à ce stage."
          backTo={backTo}
          backLabel="Retour"
          actions={
            isAdmin ? (
              <Button onClick={() => setShowCreate(true)} aria-label="Créer un nouveau jalon">
                <Plus className="h-4 w-4 mr-2" aria-hidden />
                Créer un jalon
              </Button>
            ) : undefined
          }
        />

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700 flex flex-col sm:flex-row sm:items-center gap-3">
              <span>Impossible de charger les jalons.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Réessayer le chargement">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mr-3" aria-hidden />
            <span>Chargement des jalons…</span>
          </div>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FolderOpen className="h-12 w-12 mb-3 opacity-40" aria-hidden />
              <p className="text-sm font-medium text-slate-700">Aucun jalon pour ce stage</p>
              {isAdmin && (
                <Button className="mt-4" onClick={() => setShowCreate(true)}>
                  Créer le premier jalon
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && sorted.length > 0 && (
          <Card className="border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16">Ordre</th>
                    <th className="px-4 py-3 font-medium">Libellé</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Échéance</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sorted.map((j) => (
                    <tr
                      key={j.id}
                      tabIndex={0}
                      role="link"
                      aria-label={`Ouvrir le jalon ${j.label}`}
                      className="hover:bg-slate-50 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      onClick={() => openDetail(j)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetail(j);
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <ListOrdered className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                          {j.order}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{j.label}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {j.dueDate ? new Date(j.dueDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <JalonStatusBadge status={j.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {showCreate && <CreateJalonModal stageId={stageId} onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default JalonsListPage;
