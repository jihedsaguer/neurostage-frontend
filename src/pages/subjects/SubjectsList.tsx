import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFetchSubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import type { Subject } from '@/types/subject.types';
import { SUBJECT_LEVELS } from '@/types/subject.types';
import { useAppSelector } from '@/redux/hooks';
import { useAiFeatures } from '@/lib/hooks/useAiFeatures';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import SubjectCard from '@/components/subjects/SubjectCard';
import GenerateDraftSheet from '@/components/ai/GenerateDraftSheet';

import { Plus, Search, Sparkles, LayoutGrid, List, X } from 'lucide-react';

// ─── View mode persisted in localStorage ────────────────────────────────────

function getInitialViewMode(): 'grid' | 'list' {
  try {
    const stored = localStorage.getItem('subjectViewMode');
    if (stored === 'grid' || stored === 'list') return stored;
  } catch {
    // ignore
  }
  return 'grid';
}

// ─── Component ───────────────────────────────────────────────────────────────

const SubjectsList = () => {
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.role);
  const { canGenerateDraft } = useAiFeatures();

  // Filters
  const [search, setSearch]         = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [techFilter, setTechFilter]   = useState('');
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>(getInitialViewMode);
  const [draftOpen, setDraftOpen]     = useState(false);

  const hasActiveFilters = !!(search || levelFilter || techFilter);

  const clearFilters = useCallback(() => {
    setSearch('');
    setLevelFilter('');
    setTechFilter('');
  }, []);

  const toggleViewMode = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    try { localStorage.setItem('subjectViewMode', mode); } catch { /* ignore */ }
  }, []);

  // Pass filters to backend — avoids loading all subjects just to filter client-side
  const { data, isLoading, isError, refetch } = useFetchSubjectsQuery({
    search:  search.trim() || undefined,
    level:   levelFilter   || undefined,
    technologies: techFilter ? [techFilter] : undefined,
    limit: 100,
  });

  const subjects: Subject[] = data?.data ?? [];
  const total = data?.total ?? subjects.length;

  // Extract unique technologies from current result set for the dropdown
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    subjects.forEach((s) => s.technologies?.forEach((t) => techs.add(t)));
    return Array.from(techs).sort();
  }, [subjects]);

  const canCreate =
    role === 'encadrant_pro'      ||
    role === 'student'            ||
    role === 'super_admin'        ||
    role === 'admin_formation'    ||
    role === 'encadrant_academique';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Subjects Catalogue"
          subtitle="Browse available internship subjects and filter the catalogue by level, technology or keywords."
          backTo={-1}
          actions={
            canCreate || canGenerateDraft ? (
              <div className="flex flex-wrap gap-2">
                {canGenerateDraft && (
                  <Button variant="outline" onClick={() => setDraftOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                    <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                      ✨ AI
                    </Badge>
                  </Button>
                )}
                {canCreate && (
                  <Button onClick={() => navigate('/subjects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {role === 'student' ? 'Propose Subject' : 'Create Subject'}
                  </Button>
                )}
              </div>
            ) : undefined
          }
        />

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
                <Input
                  placeholder="Search by title or description…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Search subjects"
                />
              </div>

              {/* Level */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                aria-label="Filter by level"
              >
                <option value="">All Levels</option>
                {SUBJECT_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              {/* Technologies */}
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                aria-label="Filter by technology"
              >
                <option value="">All Technologies</option>
                {allTechnologies.map((tech) => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Toolbar: results count + view toggle + clear */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {!isLoading && (
              <p className="text-sm text-slate-500" aria-live="polite">
                {isError ? '' : `Showing ${subjects.length}${total > subjects.length ? ` of ${total}` : ''} subject${total !== 1 ? 's' : ''}`}
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700 h-7 gap-1"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear filters
              </Button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-md border border-slate-200 p-0.5 bg-white">
            <button
              type="button"
              onClick={() => toggleViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => toggleViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-center gap-4">
              <p className="text-red-700 flex-1">Failed to load subjects. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !isError && subjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 mb-4">
                {hasActiveFilters ? 'No subjects match your filters.' : 'No subjects found.'}
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                )}
                {canCreate && (
                  <Button onClick={() => navigate('/subjects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Subject
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subject grid / list */}
        {!isLoading && !isError && subjects.length > 0 && (
          viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )
        )}
      </div>

      {canGenerateDraft && (
        <GenerateDraftSheet open={draftOpen} onOpenChange={setDraftOpen} />
      )}
    </div>
  );
};

export default SubjectsList;
