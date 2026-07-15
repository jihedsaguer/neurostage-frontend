import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetSubjectSuggestionsQuery,
} from '@/redux/features/profile/profileApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { UpdateProfileDto, DocumentType } from '@/types/profile.types';
import {
  acceptAttributeForDocumentType,
  validateProfileDocument,
} from '@/lib/profileDocumentValidation';
import { AiProcessingBanner } from '@/components/ai/AiProcessingBanner';
import type { PollingStatus } from '@/components/ai/AiProcessingBanner';

import { getApiErrorMessage } from '@/lib/apiErrorMessage';
import {
  ArrowLeft,
  User,
  FileText,
  Trash2,
  Upload,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  X,
} from 'lucide-react';

// ─── Completion bar ───────────────────────────────────────────────────────────

const CompletionBar = ({ pct, isComplete }: { pct: number; isComplete: boolean }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600 font-medium">Profile completion</span>
      <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
        {pct}%{isComplete && ' ✓'}
      </span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);

// ─── Document type labels ─────────────────────────────────────────────────────

const DOC_LABELS: Record<DocumentType, string> = {
  CV:          'Curriculum Vitae',
  TRANSCRIPT:  'Academic Transcript',
  CERTIFICATE: 'Certificate',
  CIN:         'National ID (CIN)',
  OTHER:       'Other',
};

const DOC_TYPES: DocumentType[] = ['CV', 'TRANSCRIPT', 'CERTIFICATE', 'CIN', 'OTHER'];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // ── Profile ──────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetMyProfileQuery();
  const { refetch: refetchSuggestions } = useGetSubjectSuggestionsQuery(undefined, { skip: true });
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [form, setForm] = useState<UpdateProfileDto>({
    phone: '',
    university: '',
    level: '',
    graduationYear: undefined,
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // AI Polling State
  const [isPolling, setIsPolling] = useState(false);
  const [, setPollingAttempts] = useState(0);
  const [pollingStatus, setPollingStatus] = useState<PollingStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAiProcessed = profile?.isAiProcessed ?? false;

  useEffect(() => {
    if (!isAiProcessed && isPolling) {
      intervalRef.current = setInterval(async () => {
        try {
          const res = await refetchProfile().unwrap();
          if (res.isAiProcessed) {
            setPollingStatus('success');
            setIsPolling(false);
          } else {
            setPollingAttempts((prev) => {
              const next = prev + 1;
              if (next >= 12) {
                setPollingStatus('timeout');
                setIsPolling(false);
              }
              return next;
            });
          }
        } catch (err) {
          console.error('Polling profile failed:', err);
        }
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAiProcessed, isPolling, refetchProfile]);


  useEffect(() => {
    if (profile) {
      setForm({
        phone:          profile.phone ?? '',
        university:     profile.university ?? '',
        level:          profile.level ?? '',
        graduationYear: profile.graduationYear ?? undefined,
        skills:         profile.skills ?? [],
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    try {
      await updateProfile(form).unwrap();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Update failed';
      setProfileError(msg);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills?.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...(prev.skills ?? []), s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills?.filter((s) => s !== skill) ?? [] }));
  };

  // ── Documents ─────────────────────────────────────────────────────────────
  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | ''>('');
  const { data: docsResponse, isLoading: docsLoading } = useGetDocumentsQuery(
    docTypeFilter ? { type: docTypeFilter, limit: 20 } : { limit: 20 }
  );
  const documents = docsResponse?.data ?? [];
  const cvDocument = documents.find((d) => d.type === 'CV');

  const [createDocument, { isLoading: uploading }] = useCreateDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [uploadType, setUploadType] = useState<DocumentType>('CV');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadTypeChange = (type: DocumentType) => {
    setUploadType(type);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess(false);

    const validationError = validateProfileDocument(file, 'CV');
    if (validationError) {
      setUploadError(validationError);
      if (cvFileInputRef.current) cvFileInputRef.current.value = '';
      return;
    }

    try {
      await createDocument({ file, type: 'CV' }).unwrap();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setPollingStatus('processing');
      setPollingAttempts(0);
      setIsPolling(true);
    } catch (err: unknown) {
      setUploadError(getApiErrorMessage(err, 'CV upload failed.'));
    } finally {
      if (cvFileInputRef.current) cvFileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess(false);

    const validationError = validateProfileDocument(file, uploadType);
    if (validationError) {
      setUploadError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      await createDocument({ file, type: uploadType }).unwrap();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      if (uploadType === 'CV') {
        setPollingStatus('processing');
        setPollingAttempts(0);
        setIsPolling(true);
      }
    } catch (err: unknown) {
      setUploadError(getApiErrorMessage(err, 'Document upload failed.'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id).unwrap();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
            <p className="text-slate-500 text-sm">Manage your personal information and documents</p>
          </div>
        </div>

        {/* Identity card */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
            </div>
            {profile && (
              <CompletionBar pct={profile.completionPercentage} isComplete={profile.isComplete} />
            )}
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            <CardDescription>Keep your academic details up to date</CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="flex items-center gap-2 text-slate-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile…
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Profile updated successfully
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+213 xxx xxx xxx"
                      value={form.phone ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      placeholder="e.g. USTHB"
                      value={form.university ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="level">Level</Label>
                    <select
                      id="level"
                      value={form.level ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="">Select level…</option>
                      {['Licence', 'Master', 'Ingénieur', 'Doctorat'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min={2020}
                      max={2035}
                      placeholder="e.g. 2026"
                      value={form.graduationYear ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, graduationYear: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill…"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {(form.skills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.skills?.map((skill) => (
                        <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* CV upload — AI-powered */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Curriculum Vitae
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    ✨ AI
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Upload your CV to enable AI-powered subject recommendations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">Accepted formats</p>
              <p>PDF, DOC, or DOCX — maximum 10 MB</p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Uploading…</p>
                <Progress value={undefined} className="h-2 animate-pulse" />
              </div>
            )}

            {uploadError && uploadType === 'CV' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            {pollingStatus && (
              <AiProcessingBanner
                status={pollingStatus}
                onRefresh={() => {
                  refetchProfile();
                  refetchSuggestions();
                }}
              />
            )}

            {cvDocument ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{cvDocument.fileName}</p>
                    <p className="text-xs text-slate-500">{formatBytes(cvDocument.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => cvFileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  Replace CV
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-3">No CV uploaded yet</p>
                <Button
                  type="button"
                  disabled={uploading}
                  onClick={() => cvFileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload CV
                </Button>
              </div>
            )}

            <input
              ref={cvFileInputRef}
              type="file"
              className="hidden"
              accept={acceptAttributeForDocumentType('CV')}
              onChange={handleCvUpload}
            />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <div>
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <CardDescription>Upload your CV, transcripts, and certificates</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={uploadType}
                  onChange={(e) => handleUploadTypeChange(e.target.value as DocumentType)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{DOC_LABELS[t]}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={acceptAttributeForDocumentType(uploadType)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Document uploaded successfully
              </div>
            )}
            {pollingStatus && uploadType !== 'CV' && (
              <div className="mb-4">
                <AiProcessingBanner status={pollingStatus} />
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setDocTypeFilter('')}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  docTypeFilter === '' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {DOC_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setDocTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    docTypeFilter === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {docsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents…
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No documents yet</p>
                <p className="text-xs mt-1">Upload your CV or transcripts to complete your profile</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{DOC_LABELS[doc.type]}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{formatBytes(doc.size)}</span>
                          <span className="text-xs text-slate-400">·</span>
                          {doc.scanOk ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                              <Clock className="h-3 w-3" /> Scanning…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle>Delete Document</CardTitle>
              <CardDescription>This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
