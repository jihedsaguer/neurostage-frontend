import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubjectStatusBadge from './SubjectStatusBadge';
import type { Subject } from '@/types/subject.types';
import { useAppSelector } from '@/redux/hooks';
import { Eye, Edit } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  showActions?: boolean;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

const LEVEL_COLOR: Record<string, string> = {
  L1:   'bg-green-100  text-green-700',
  L2:   'bg-green-100  text-green-700',
  L3:   'bg-green-100  text-green-700',
  M1:   'bg-blue-100   text-blue-700',
  M2:   'bg-blue-100   text-blue-700',
  ING1: 'bg-purple-100 text-purple-700',
  ING2: 'bg-purple-100 text-purple-700',
  ING3: 'bg-purple-100 text-purple-700',
  // Legacy values from the existing SUBJECT_LEVELS constant
  Licence:    'bg-green-100  text-green-700',
  Master:     'bg-blue-100   text-blue-700',
  Ingénieur:  'bg-purple-100 text-purple-700',
  Doctorat:   'bg-orange-100 text-orange-700',
};

const SubjectCard = ({ subject, showActions = false, onEdit }: SubjectCardProps) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const role = useAppSelector((s) => s.auth.role);

  const visibleTech = subject.technologies.slice(0, 3);
  const remainingCount = subject.technologies.length - 3;
  const levelColor = LEVEL_COLOR[subject.level] ?? 'bg-slate-100 text-slate-600';
  const isOwner = currentUser?.id === subject.createdBy.id;

  // Role-based primary action
  const renderAction = () => {
    if (role === 'student') {
      return (
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/subjects/${subject.id}`)}
          aria-label={`View details for ${subject.title}`}
        >
          <Eye className="h-4 w-4 mr-1" aria-hidden />
          View
        </Button>
      );
    }
    if (isOwner && (role === 'encadrant_pro' || role === 'encadrant_academique')) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/subjects/${subject.id}/edit`)}
          aria-label={`Edit ${subject.title}`}
        >
          <Edit className="h-4 w-4 mr-1" aria-hidden />
          Edit
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={() => navigate(`/subjects/${subject.id}`)}
        aria-label={`View details for ${subject.title}`}
      >
        <Eye className="h-4 w-4 mr-1" aria-hidden />
        View Details
      </Button>
    );
  };

  return (
    <Card className="h-full flex flex-col border border-slate-200 bg-white transition-shadow hover:shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{subject.title}</CardTitle>
          <SubjectStatusBadge status={subject.status} />
        </div>
        <CardDescription className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
          <span>By {subject.createdBy.firstName} {subject.createdBy.lastName}</span>
          {subject.level && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
              {subject.level}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-slate-700 mb-4 line-clamp-3">
          {subject.description}
        </p>

        {subject.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {visibleTech.map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          {renderAction()}

          {showActions && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(subject)}
              aria-label={`Edit ${subject.title}`}
            >
              <Edit className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
