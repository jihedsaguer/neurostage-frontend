import { useState, useRef } from 'react';
import { useUploadAndIngestDocumentMutation } from '@/redux/features/rag/ragApi';
import { useAiFeatures } from '@/lib/hooks/useAiFeatures';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  'Convention',
  'Règlement',
  'Guide',
  'Procédure',
  'Autre',
] as const;

const RagDocumentsPage = () => {
  const { canIngestDocuments } = useAiFeatures();
  const [uploadAndIngest, { isLoading }] = useUploadAndIngestDocumentMutation();

  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<string>('Convention');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ chunksIndexed: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!canIngestDocuments) {
    return (
      <DashboardLayout title="Knowledge Base" subtitle="Access denied">
        <div className="p-6">
          <p className="text-slate-600">You do not have permission to manage the knowledge base.</p>
        </div>
      </DashboardLayout>
    );
  }

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are accepted.';
    }
    if (f.size > 10 * 1024 * 1024) {
      return 'File must be under 10 MB.';
    }
    return null;
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
    if (!documentName) {
      setDocumentName(f.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentName.trim()) {
      setError('Please provide a PDF file and document name.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const result = await uploadAndIngest({
        file,
        documentName: documentName.trim(),
        documentType,
      }).unwrap();
      setSuccess({ chunksIndexed: result.chunksIndexed });
      setFile(null);
      setDocumentName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getApiErrorMessage(err, 'Document ingestion failed. Please try again.'));
    }
  };

  return (
    <DashboardLayout
      title="Knowledge Base"
      subtitle="Upload procedure documents to train the AI assistant"
      brandName="Formation Portal"
    >
      <div className="p-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Upload Document
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                ✨ AI
              </Badge>
            </CardTitle>
            <CardDescription>
              PDF documents are uploaded and indexed for the NEUROSTAGE Assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) handleFile(dropped);
                }}
              >
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-2">Drag and drop a PDF here, or</p>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Browse files
                </Button>
                <p className="text-xs text-slate-400 mt-3">PDF only — max 10 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                {file && (
                  <p className="text-sm text-slate-700 mt-3 font-medium">{file.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">Document name</Label>
                <Input
                  id="doc-name"
                  placeholder="Convention de Stage SOTETEL 2024"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Document type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading and indexing document…
                  </p>
                  <Progress className="h-2 animate-pulse" value={50} />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertTitle className="text-emerald-900">Document indexed successfully</AlertTitle>
                  <AlertDescription className="text-emerald-700">
                    {success.chunksIndexed} chunks added to the knowledge base.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading || !file} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Indexing…
                  </>
                ) : (
                  'Upload & Index'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indexed Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p>
                Documents are indexed in the AI knowledge base. A listing endpoint is not yet
                available — uploaded documents are searchable via the NEUROSTAGE Assistant.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Future: GET /generation-ia — AI generation history requires a backend endpoint (skipped Phase 4E). */}
      </div>
    </DashboardLayout>
  );
};

export default RagDocumentsPage;
