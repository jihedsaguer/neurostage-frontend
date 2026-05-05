import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubjectStatusBadge from './SubjectStatusBadge';
import type { Subject } from '@/types/subject.types';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  showActions?: boolean;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

const SubjectCard = ({ subject, showActions = false, onEdit, onDelete }: SubjectCardProps) => {
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{subject.title}</CardTitle>
          <SubjectStatusBadge status={subject.status} />
        </div>
        <CardDescription className="text-sm text-slate-600">
          By {subject.createdBy.firstName} {subject.createdBy.lastName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-slate-700 mb-4 line-clamp-3">
          {truncateText(subject.description, 150)}
        </p>

        {subject.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {subject.technologies.slice(0, 3).map((tech, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {tech}
              </span>
            ))}
            {subject.technologies.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{subject.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {subject.level && (
          <p className="text-xs text-slate-500 mb-4">Level: {subject.level}</p>
        )}

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/subjects/${subject.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          
          {showActions && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(subject)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subject)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
