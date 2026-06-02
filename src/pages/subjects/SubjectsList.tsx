import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFetchSubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import type { Subject } from '@/types/subject.types';import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectCard from '@/components/subjects/SubjectCard';

import { Plus, Search } from 'lucide-react';

const SubjectsList = () => {
  const navigate = useNavigate();

  const role = useAppSelector((state) => state.auth.role);

  // ✅ Correct RTK Query usage
  const { data, isLoading, isError } = useFetchSubjectsQuery({});

  // ✅ Proper typing (fixes all "implicit any" issues)
  const subjects: Subject[] = data?.data ?? [];

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');

  // ✅ Extract unique technologies
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();

    subjects.forEach((s) => {
      s.technologies?.forEach((t) => techs.add(t));
    });

    return Array.from(techs).sort();
  }, [subjects]);

  // ✅ Extract unique levels
  const allLevels = useMemo(() => {
    const levels = new Set<string>();

    subjects.forEach((s) => {
      if (s.level) levels.add(s.level);
    });

    return Array.from(levels).sort();
  }, [subjects]);

  // ✅ Frontend filtering (can later move to backend)
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.title.toLowerCase().includes(search.toLowerCase()) ||
        subject.description.toLowerCase().includes(search.toLowerCase());

      const matchesLevel = !levelFilter || subject.level === levelFilter;

      const matchesTech =
        !techFilter || subject.technologies?.includes(techFilter);

      return matchesSearch && matchesLevel && matchesTech;
    });
  }, [subjects, search, levelFilter, techFilter]);

  const canCreate =
    role === 'encadrant_pro' ||
    role === 'student' ||
    role === 'super_admin' ||
    role === 'admin_formation';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Subjects Catalogue
            </h1>
            <p className="text-slate-600 mt-1">
              Browse available internship subjects
            </p>
          </div>

          {canCreate && (
            <Button onClick={() => navigate('/subjects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {role === 'student' ? 'Propose Subject' : 'Create Subject'}
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Level */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">All Levels</option>
                {allLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* Technologies */}
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">All Technologies</option>
                {allTechnologies.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading subjects...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-700">
                Failed to load subjects. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !isError && filteredSubjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 mb-4">No subjects found</p>

              {canCreate && (
                <Button onClick={() => navigate('/subjects/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Subject
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!isLoading && !isError && filteredSubjects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsList;