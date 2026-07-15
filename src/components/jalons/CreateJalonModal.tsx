import { useState } from 'react';
import { useCreateJalonMutation } from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';

interface Props {
  stageId: string;
  onClose: () => void;
}

const CreateJalonModal = ({ stageId, onClose }: Props) => {
  const [createJalon, { isLoading }] = useCreateJalonMutation();
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [order, setOrder] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!label.trim()) {
      setError('Le libellé est obligatoire.');
      return;
    }
    if (!dueDate) {
      setError('La date d’échéance est obligatoire.');
      return;
    }
    if (order < 1) {
      setError('L’ordre doit être au moins 1.');
      return;
    }
    try {
      await createJalon({
        stageId,
        label: label.trim(),
        description: description.trim() || undefined,
        dueDate,
        order,
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erreur lors de la création du jalon.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Créer un jalon</CardTitle>
          <CardDescription>Définir un jalon et une échéance pour ce stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="jalon-label">Libellé</Label>
              <Input
                id="jalon-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                aria-required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jalon-desc">Description (optionnel)</Label>
              <textarea
                id="jalon-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                aria-label="Description du jalon"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="jalon-due">Date d’échéance</Label>
                <Input
                  id="jalon-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  aria-required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jalon-order">Ordre (≥ 1)</Label>
                <Input
                  id="jalon-order"
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
                  required
                  aria-required
                />
              </div>
            </div>

            <input type="hidden" name="stageId" value={stageId} readOnly aria-hidden />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
                Créer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJalonModal;
