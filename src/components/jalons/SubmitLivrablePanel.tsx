import { useRef, useState } from 'react';
import { useSubmitLivrableMutation } from '@/redux/features/jalons/jalonsApi';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { computeFileSha256Hex } from '@/lib/jalonUtils';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';

interface Props {
  jalonId: string;
}

const SubmitLivrablePanel = ({ jalonId }: Props) => {
  const [submitLivrable, { isLoading }] = useSubmitLivrableMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [studentNote, setStudentNote] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSelectedName(file.name);

    try {
      const hash = await computeFileSha256Hex(file);
      // Placeholder URL — same pattern as ProfilePage until storage is configured
      const placeholderUrl = `https://storage.example.com/${Date.now()}-${file.name}`;

      await submitLivrable({
        id: jalonId,
        body: {
          fileName: file.name,
          fileUrl: placeholderUrl,
          fileType: file.type || 'application/octet-stream',
          size: file.size,
          hash,
          studentNote: studentNote.trim() || undefined,
        },
      }).unwrap();

      setStudentNote('');
      setSelectedName('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Échec de la soumission du livrable.'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Soumettre un livrable</CardTitle>
        <CardDescription>
          Téléversez votre fichier. Un hash SHA-256 est calculé côté client avant envoi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="livrable-note">Note pour l’encadrant (optionnel)</Label>
          <textarea
            id="livrable-note"
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            aria-label="Note étudiant pour le livrable"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            id="livrable-file"
            onChange={handleFileChange}
            disabled={isLoading}
            aria-label="Choisir un fichier à soumettre"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Soumettre un livrable"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4 mr-2" aria-hidden />
            )}
            Choisir un fichier
          </Button>
          {selectedName && !isLoading && (
            <span className="text-sm text-slate-600">Dernier fichier : {selectedName}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmitLivrablePanel;
