import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSubjectSuggestionsQuery } from '@/redux/features/profile/profileApi';
import { useGetMyProfileQuery } from '@/redux/features/profile/profileApi';
import { useGetSubjectByIdQuery } from '@/redux/features/subjects/subjectsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload } from 'lucide-react';
import type { SubjectSuggestion } from '@/types/profile.types';
import { cn } from '@/lib/utils';

const LEVEL_BADGE_STYLES: Record<string, string> = {
  L1: 'bg-sky-100 text-sky-800 border-sky-200',
  L2: 'bg-sky-200 text-sky-900 border-sky-300',
  L3: 'bg-sky-300 text-sky-950 border-sky-400',
  M1: 'bg-violet-100 text-violet-800 border-violet-200',
  M2: 'bg-violet-200 text-violet-900 border-violet-300',
  ING1: 'bg-amber-100 text-amber-800 border-amber-200',
  ING2: 'bg-amber-200 text-amber-900 border-amber-300',
  ING3: 'bg-amber-300 text-amber-950 border-amber-400',
  Licence: 'bg-sky-100 text-sky-800 border-sky-200',
  Master: 'bg-violet-100 text-violet-800 border-violet-200',
  Ingénieur: 'bg-amber-100 text-amber-800 border-amber-200',
  Doctorat: 'bg-rose-100 text-rose-800 border-rose-200',
};

function scoreBarColor(score: number): string {
  if (score > 0.7) return 'bg-emerald-500';
  if (score >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function LevelBadge({ level }: { level: string }) {
  const key = level?.toUpperCase().replace(/\s/g, '') ?? '';
  const style = LEVEL_BADGE_STYLES[key] ?? LEVEL_BADGE_STYLES[level] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <Badge variant="outline" className={cn('text-[10px] font-semibold', style)}>
      {level}
    </Badge>
  );
}

const SuggestionCardSkeleton = () => (
  <Card className="border-slate-200 rounded-3xl overflow-hidden">
    <CardContent className="p-5 space-y-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-2 w-full" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-2xl" />
    </CardContent>
  </Card>
);

const SuggestionCard = ({ suggestion }: { suggestion: SubjectSuggestion }) => {
  const navigate = useNavigate();
  const { data: subject, isLoading, isError } = useGetSubjectByIdQuery(suggestion.subjectId);

  if (isLoading) return <SuggestionCardSkeleton />;

  if (isError || !subject) {
    return (
      <Card className="border-slate-200 rounded-3xl bg-slate-50">
        <CardContent className="p-5 text-slate-500 text-sm text-center">
          Suggested subject is unavailable.
        </CardContent>
      </Card>
    );
  }

  const pct = Math.round(suggestion.score * 100);
  const barColor = scoreBarColor(suggestion.score);

  return (
    <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white rounded-3xl overflow-hidden">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4
              className="font-semibold text-slate-900 leading-snug line-clamp-2 flex-1 hover:text-blue-600 transition-colors"
              title={subject.title}
            >
              {subject.title}
            </h4>
            {subject.level && <LevelBadge level={subject.level} />}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Match Score</span>
              <span className={cn(
                'font-semibold',
                suggestion.score > 0.7 && 'text-emerald-600',
                suggestion.score >= 0.5 && suggestion.score <= 0.7 && 'text-amber-600',
                suggestion.score < 0.5 && 'text-red-600',
              )}>
                {pct}%
              </span>
            </div>
            <div className="relative">
              <Progress value={pct} className="h-2" />
              <div
                className={cn('absolute inset-y-0 left-0 rounded-full transition-all', barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {suggestion.matchedKeywords && suggestion.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {suggestion.matchedKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="text-[10px] md:text-xs bg-blue-50 text-blue-700 border-blue-100"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          <Button
            onClick={() => navigate(`/subjects/${subject.id}`)}
            className="w-full text-xs py-2 h-auto bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium shadow-sm"
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const SubjectSuggestions = () => {
  const navigate = useNavigate();
  const { data: profile } = useGetMyProfileQuery();
  const { data, isLoading, isError, refetch } = useGetSubjectSuggestionsQuery();

  const isAiProcessed = profile?.isAiProcessed ?? false;

  useEffect(() => {
    if (isAiProcessed) {
      refetch();
    }
  }, [isAiProcessed, refetch]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SuggestionCardSkeleton />
        <SuggestionCardSkeleton />
        <SuggestionCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="rounded-3xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load suggestions</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>Please check your connection and try again.</span>
          <Button variant="outline" size="sm" className="w-fit" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const suggestions = data?.suggestions ?? [];

  if (suggestions.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-slate-700 font-medium text-sm">
            {data?.message || 'No suggestions yet — upload your CV to get personalized recommendations'}
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Our AI analysis will extract your skills and academic profile to suggest matching internship subjects.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CV
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.subjectId} suggestion={suggestion} />
      ))}
    </div>
  );
};

export default SubjectSuggestions;
