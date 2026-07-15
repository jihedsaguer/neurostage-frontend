import { useState } from 'react';
import { useFetchUsersQuery } from '@/redux/features/users/usersApi';
import { useAssignProMutation, useAssignAcadMutation } from '@/redux/features/stages/stagesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RoleName } from '@/types/user';
import { Loader2, Search } from 'lucide-react';

interface Props {
  stageId: string;
  mode: 'pro' | 'acad';
  onClose: () => void;
}

const ROLE_MAP: Record<'pro' | 'acad', RoleName> = {
  pro:  'encadrant_pro',
  acad: 'encadrant_academique',
};

const AssignModal = ({ stageId, mode, onClose }: Props) => {
  const { data: allUsers = [], isLoading: loadingUsers } = useFetchUsersQuery();
  const [assignPro,  { isLoading: assigningPro }]  = useAssignProMutation();
  const [assignAcad, { isLoading: assigningAcad }] = useAssignAcadMutation();

  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState('');
  const [error, setError]     = useState('');

  const targetRole = ROLE_MAP[mode];
  const isLoading  = assigningPro || assigningAcad;

  const candidates = allUsers.filter((u) => {
    const hasRole = u.roles?.some((r) => r.name === targetRole);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return hasRole && matchSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError('Veuillez sélectionner un encadrant.'); return; }
    setError('');
    try {
      if (mode === 'pro') {
        await assignPro({ id: stageId, payload: { encadrantProId: selected } }).unwrap();
      } else {
        await assignAcad({ id: stageId, payload: { encadrantAcadId: selected } }).unwrap();
      }
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message ?? 'Erreur lors de l\'assignation');
    }
  };

  const title = mode === 'pro' ? 'Assigner un Encadrant Pro' : 'Assigner un Encadrant Académique';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Sélectionnez un encadrant dans la liste</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingUsers ? (
              <div className="flex items-center gap-2 text-slate-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement…
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1 border rounded-md p-2">
                {candidates.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun encadrant trouvé</p>
                ) : (
                  candidates.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selected === u.id ? 'bg-blue-50 border border-blue-300' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="encadrant"
                        value={u.id}
                        checked={selected === u.id}
                        onChange={() => setSelected(u.id)}
                        className="accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !selected}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assigner
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignModal;
