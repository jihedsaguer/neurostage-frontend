import { useEffect, useState } from 'react';
import { usePatchAcadCommentMutation } from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';

interface Props {
  jalonId: string;
  initialComment: string | null;
}

const AcadCommentPanel = ({ jalonId, initialComment }: Props) => {
  const [patchAcadComment, { isLoading }] = usePatchAcadCommentMutation();
  const [acadComment, setAcadComment] = useState(initialComment ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAcadComment(initialComment ?? '');
  }, [initialComment]);

  const handleSave = async () => {
    setError('');
    setSaved(false);
    try {
      await patchAcadComment({
        id: jalonId,
        body: { acadComment: acadComment.trim() },
      }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Échec de l’enregistrement du commentaire.'));
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Commentaire académique</CardTitle>
        <CardDescription>Commentaire visible pour le suivi académique du jalon.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="acad-comment">Commentaire</Label>
          <textarea
            id="acad-comment"
            value={acadComment}
            onChange={(e) => setAcadComment(e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            aria-label="Commentaire de l’encadrant académique"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isLoading} aria-label="Enregistrer le commentaire académique">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
            Enregistrer
          </Button>
          {saved && <span className="text-sm text-green-600" role="status">Enregistré</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcadCommentPanel;
