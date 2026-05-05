import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateSubjectMutation, useUpdateSubjectMutation, useFetchSubjectByIdQuery } from '@/redux/features/subjects/subjectsApi';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SUBJECT_LEVELS } from '@/types/subject.types';
import type { CreateSubjectDto } from '@/types/subject.types';

const SubjectForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.role);
  const isEdit = !!id;

  const { data: existingSubject } = useFetchSubjectByIdQuery(id!, { skip: !id });
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();

  const [formData, setFormData] = useState<CreateSubjectDto>({
    title: '',
    description: '',
    technologies: [],
    level: '',
    prerequisites: '',
  });
  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingSubject) {
      setFormData({
        title: existingSubject.title,
        description: existingSubject.description,
        technologies: existingSubject.technologies,
        level: existingSubject.level,
        prerequisites: existingSubject.prerequisites,
      });
    }
  }, [existingSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEdit && id) {
        await updateSubject({ id, data: formData }).unwrap();
      } else {
        await createSubject(formData).unwrap();
      }
      navigate(role === 'student' ? '/subjects/my' : '/subjects');
    } catch (err: any) {
      setError(err?.data?.message || 'An error occurred');
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter(t => t !== tech) || []
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Subject' : role === 'student' ? 'Propose Subject' : 'Create Subject'}</CardTitle>
            <CardDescription>
              {role === 'student' ? 'Propose a new internship subject for validation' : 'Create a new internship subject'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Technologies</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    placeholder="Add technology..."
                  />
                  <Button type="button" onClick={addTechnology} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies?.map(tech => (
                    <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-2">
                      {tech}
                      <button type="button" onClick={() => removeTechnology(tech)} className="text-blue-900 hover:text-blue-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Select level...</option>
                  {SUBJECT_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isCreating || isUpdating} className="flex-1">
                  {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Subject' : 'Create Subject'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectForm;
