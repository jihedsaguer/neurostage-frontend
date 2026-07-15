import { useState } from 'react';
import { useUpdateStageMutation } from '@/redux/features/stages/stagesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Stage, StageStatus, UpdateStagePayload } from '@/types/stage.types';
import { STAGE_STATUS_LABELS } from '@/types/stage.types';
import { Loader2 } from 'lucide-react';

const STATUS_OPTIONS: StageStatus[] = ['PENDING_ACAD', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

interface Props {
  stage: Stage;
  onClose: () => void;
}

const EditStageModal = ({ stage, onClose }: Props) => {
  const [updateStage, { isLoading }] = useUpdateStageMutation();
  const [form, setForm] = useState<UpdateStagePayload>({
    status:     stage.status,
    startDate:  stage.startDate ?? '',
    endDate:    stage.endDate ?? '',
    adminNotes: stage.adminNotes ?? '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('La date de fin doit être après la date de début.');
      return;
    }
    try {
      await updateStage({ id: stage.id, payload: form }).unwrap();
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message ?? 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Modifier le stage</CardTitle>
          <CardDescription>{stage.subject.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StageStatus }))}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STAGE_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={form.startDate ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes admin</Label>
              <textarea
                value={form.adminNotes ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditStageModal;
