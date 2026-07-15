import { useState } from 'react';
import { useValidateJalonMutation } from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';

interface Props {
  jalonId: string;
}

const ValidateJalonPanel = ({ jalonId }: Props) => {
  const [validateJalon, { isLoading }] = useValidateJalonMutation();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [proComment, setProComment] = useState('');
  const [error, setError] = useState('');

  const handleValidate = async () => {
    setError('');
    try {
      await validateJalon({ id: jalonId, body: { action: 'VALIDATE' } }).unwrap();
      setShowRejectForm(false);
      setProComment('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Échec de la validation.'));
    }
  };

  const handleReject = async () => {
    setError('');
    if (!proComment.trim()) {
      setError('Un commentaire est obligatoire pour rejeter le livrable.');
      return;
    }
    try {
      await validateJalon({
        id: jalonId,
        body: { action: 'REJECT', proComment: proComment.trim() },
      }).unwrap();
      setShowRejectForm(false);
      setProComment('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Échec du rejet.'));
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Validation professionnelle</CardTitle>
        <CardDescription>Valider ou rejeter le livrable soumis par l’étudiant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        {!showRejectForm ? (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleValidate}
              disabled={isLoading}
              aria-label="Valider le jalon"
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" aria-hidden />
              )}
              Valider
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
              disabled={isLoading}
              aria-label="Rejeter le jalon"
            >
              <XCircle className="h-4 w-4 mr-2" aria-hidden />
              Rejeter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pro-comment">Commentaire de rejet (obligatoire)</Label>
              <textarea
                id="pro-comment"
                value={proComment}
                onChange={(e) => setProComment(e.target.value)}
                rows={4}
                required
                aria-required
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                aria-label="Commentaire professionnel pour le rejet"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={isLoading}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isLoading} aria-label="Confirmer le rejet">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
                Confirmer le rejet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidateJalonPanel;
