import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, X, Check } from 'lucide-react';
import { useGetStudentsQuery } from '@/redux/features/users/usersApi';
import { useGenerateDraftMutation } from '@/redux/features/subjects/subjectsApi';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';
import type { GenerateDraftResponse } from '@/types/subject.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUBJECT_LEVELS } from '@/types/subject.types';

interface GenerateDraftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_STUDENTS = 3;
const GENERATION_ESTIMATE_MS = 120_000;

export function GenerateDraftSheet({ open, onOpenChange }: GenerateDraftSheetProps) {
  const navigate = useNavigate();
  const { data: students = [], isLoading: studentsLoading } = useGetStudentsQuery(undefined, { skip: !open });
  const [generateDraft, { isLoading: isGenerating }] = useGenerateDraftMutation();

  // Backend already filters to AI-processed students only
  const processedStudents = students;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GenerateDraftResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    titre: '',
    description: '',
    techno: [] as string[],
    prerequis: '',
    niveau: '',
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (isGenerating) {
      const start = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(95, (elapsed / GENERATION_ESTIMATE_MS) * 100);
        setProgress(pct);
      }, 500);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
      if (draft) setProgress(100);
      else setProgress(0);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isGenerating, draft]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_STUDENTS) return prev;
      return [...prev, id];
    });
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      setError('Select at least one student with a processed CV.');
      return;
    }
    setError(null);
    setDraft(null);
    try {
      const result = await generateDraft({
        studentIds: selectedIds,
        context: context.trim() || undefined,
      }).unwrap();
      setDraft(result);
      setForm({
        titre: result.titre,
        description: result.description,
        techno: result.techno ?? [],
        prerequis: result.prerequis,
        niveau: result.niveau,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'AI generation failed. Please try again.'));
    }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techno.includes(t)) {
      setForm((p) => ({ ...p, techno: [...p.techno, t] }));
    }
    setTechInput('');
  };

  const reset = () => {
    setSelectedIds([]);
    setContext('');
    setDraft(null);
    setError(null);
    setProgress(0);
    setForm({ titre: '', description: '', techno: [], prerequis: '', niveau: '' });
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate with AI
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              ✨ AI
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Create a subject draft based on selected student CVs (max {MAX_STUDENTS}).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!draft && (
            <>
              <div className="space-y-2">
                <Label>Students with processed CVs</Label>
                {studentsLoading ? (
                  <p className="text-sm text-slate-500">Loading students…</p>
                ) : processedStudents.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No students with AI-processed CVs available. Students must upload and have their CV processed first.
                  </p>
                ) : (
                  <Command className="rounded-lg border">
                    <CommandInput placeholder="Search students…" />
                    <CommandList>
                      <CommandEmpty>No students found.</CommandEmpty>
                      {processedStudents.map((student) => {
                        const selected = selectedIds.includes(student.id);
                        return (
                          <CommandItem
                            key={student.id}
                            value={`${student.firstName} ${student.lastName} ${student.university ?? ''}`}
                            onSelect={() => toggleStudent(student.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                {selected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {[student.university, student.level].filter(Boolean).join(' · ') || student.email}
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandList>
                  </Command>
                )}
                {selectedIds.length > 0 && (
                  <p className="text-xs text-slate-500">{selectedIds.length} / {MAX_STUDENTS} selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-context">Additional context (optional)</Label>
                <Textarea
                  id="ai-context"
                  placeholder="e.g. focused on network infrastructure"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isGenerating && (
                <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-purple-900">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is generating a subject based on the selected CVs…
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-purple-700">This may take 30–120 seconds.</p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || selectedIds.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Draft
                  </>
                )}
              </Button>
            </>
          )}

          {draft && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-emerald-700">Draft generated successfully</p>

              <div className="space-y-2">
                <Label htmlFor="draft-title">Title</Label>
                <Input
                  id="draft-title"
                  value={form.titre}
                  onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="draft-desc">Description</Label>
                <Textarea
                  id="draft-desc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Technologies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology…"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                  />
                  <Button type="button" variant="outline" onClick={addTech}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.techno.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button type="button" onClick={() => setForm((p) => ({ ...p, techno: p.techno.filter((x) => x !== t) }))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="draft-prereq">Prerequisites</Label>
                <Input
                  id="draft-prereq"
                  value={form.prerequis}
                  onChange={(e) => setForm((p) => ({ ...p, prerequis: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={form.niveau} onValueChange={(v) => setForm((p) => ({ ...p, niveau: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                    {form.niveau && !SUBJECT_LEVELS.includes(form.niveau as typeof SUBJECT_LEVELS[number]) && (
                      <SelectItem value={form.niveau}>{form.niveau}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    // Navigate to edit so the user can review and save
                    navigate(`/subjects/${draft.subjectId}/edit`, {
                      state: {
                        prefill: {
                          title: form.titre,
                          description: form.description,
                          technologies: form.techno,
                          prerequisites: form.prerequis,
                          level: form.niveau,
                        },
                      },
                    });
                  }}
                >
                  Edit & Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/subjects/${draft.subjectId}`);
                  }}
                >
                  View Draft
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default GenerateDraftSheet;
