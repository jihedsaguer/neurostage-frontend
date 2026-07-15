import { useState, useMemo } from 'react';
import { useCreateStageMutation } from '@/redux/features/stages/stagesApi';
import { useListAllCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import { useFetchUsersQuery } from '@/redux/features/users/usersApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CreateStagePayload } from '@/types/stage.types';
import { Loader2, Search } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// ─── Searchable select ────────────────────────────────────────────────────────

interface Option { value: string; label: string; sub?: string }

const SearchableSelect = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  loading,
}: {
  id: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  loading?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);

  const filtered = useMemo(
    () => options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sub ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [options, search]
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm text-left"
      >
        {selected ? (
          <span className="truncate">{selected.label}</span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-slate-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-sm text-slate-400 text-center">Aucun résultat</p>
            ) : (
              <>
                {/* "None" option for optional fields */}
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 italic"
                >
                  — Aucun (optionnel)
                </button>
                {filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                      value === o.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-900'
                    }`}
                  >
                    <p className="truncate">{o.label}</p>
                    {o.sub && <p className="text-xs text-slate-500 truncate">{o.sub}</p>}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const CreateStageModal = ({ onClose }: Props) => {
  const [createStage, { isLoading }] = useCreateStageMutation();

  const { data: allCandidatures = [], isLoading: loadingCandidatures } = useListAllCandidaturesQuery();
  const { data: allUsers = [],        isLoading: loadingUsers }        = useFetchUsersQuery();

  const [form, setForm] = useState<CreateStagePayload>({
    candidatureId:   '',
    encadrantProId:  '',
    encadrantAcadId: '',
    startDate:       '',
    endDate:         '',
    adminNotes:      '',
  });
  const [error, setError] = useState('');

  // Only accepted candidatures that don't already have a stage
  const candidatureOptions: Option[] = useMemo(
    () =>
      allCandidatures
        .filter((c) => c.status === 'accepted')
        .map((c) => ({
          value: c.id,
          label: `${c.student.firstName} ${c.student.lastName} — ${c.subject.title}`,
          sub:   `Candidature ${c.id.slice(0, 8)}…`,
        })),
    [allCandidatures]
  );

  const proOptions: Option[] = useMemo(
    () =>
      allUsers
        .filter((u) => u.roles?.some((r) => r.name === 'encadrant_pro'))
        .map((u) => ({
          value: u.id,
          label: `${u.firstName} ${u.lastName}`,
          sub:   u.email,
        })),
    [allUsers]
  );

  const acadOptions: Option[] = useMemo(
    () =>
      allUsers
        .filter((u) => u.roles?.some((r) => r.name === 'encadrant_academique'))
        .map((u) => ({
          value: u.id,
          label: `${u.firstName} ${u.lastName}`,
          sub:   u.email,
        })),
    [allUsers]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.candidatureId) {
      setError('Veuillez sélectionner une candidature.');
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('La date de fin doit être après la date de début.');
      return;
    }

    const payload: CreateStagePayload = {
      candidatureId: form.candidatureId,
      ...(form.encadrantProId  && { encadrantProId:  form.encadrantProId }),
      ...(form.encadrantAcadId && { encadrantAcadId: form.encadrantAcadId }),
      ...(form.startDate       && { startDate:       form.startDate }),
      ...(form.endDate         && { endDate:         form.endDate }),
      ...(form.adminNotes      && { adminNotes:      form.adminNotes }),
    };

    try {
      await createStage(payload).unwrap();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ?? 'Erreur lors de la création'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Créer un stage manuellement</CardTitle>
          <CardDescription>
            Sélectionnez une candidature acceptée et assignez les encadrants
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Candidature */}
            <div className="space-y-1.5">
              <Label htmlFor="candidatureId">
                Candidature acceptée <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                id="candidatureId"
                options={candidatureOptions}
                value={form.candidatureId}
                onChange={(v) => setForm((p) => ({ ...p, candidatureId: v }))}
                placeholder="Sélectionner une candidature…"
                loading={loadingCandidatures}
              />
              {candidatureOptions.length === 0 && !loadingCandidatures && (
                <p className="text-xs text-slate-400">
                  Aucune candidature acceptée sans stage trouvée
                </p>
              )}
            </div>

            {/* Encadrant Pro */}
            <div className="space-y-1.5">
              <Label htmlFor="encadrantProId">
                Encadrant Professionnel
                <span className="ml-1 text-xs text-slate-400">(optionnel — défaut : créateur du sujet)</span>
              </Label>
              <SearchableSelect
                id="encadrantProId"
                options={proOptions}
                value={form.encadrantProId ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, encadrantProId: v }))}
                placeholder="Sélectionner un encadrant pro…"
                loading={loadingUsers}
              />
            </div>

            {/* Encadrant Acad */}
            <div className="space-y-1.5">
              <Label htmlFor="encadrantAcadId">
                Encadrant Académique
                <span className="ml-1 text-xs text-slate-400">(optionnel)</span>
              </Label>
              <SearchableSelect
                id="encadrantAcadId"
                options={acadOptions}
                value={form.encadrantAcadId ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, encadrantAcadId: v }))}
                placeholder="Sélectionner un encadrant académique…"
                loading={loadingUsers}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes admin</Label>
              <textarea
                value={form.adminNotes}
                onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
                rows={3}
                placeholder="Notes internes optionnelles…"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !form.candidatureId}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer le stage
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStageModal;
