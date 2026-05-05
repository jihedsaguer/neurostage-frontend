import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CandidatureStatusBadge from './CandidatureStatusBadge';
import type { CanditatureResponse } from '@/types/canditatures';

interface CandidatureListProps {
  candidatures: CanditatureResponse[];
  onViewSubject?: (subjectId: string) => void;
  actionArea?: (candidature: CanditatureResponse) => React.ReactNode;
}

const CandidatureList = ({ candidatures, onViewSubject, actionArea }: CandidatureListProps) => {
  return (
    <div className="space-y-4">
      {candidatures.map((candidature) => (
        <Card key={candidature.id} className="border-slate-200">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{candidature.subject.title}</CardTitle>
              <CardDescription>
                Applied on {new Date(candidature.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CandidatureStatusBadge status={candidature.status} />
              {onViewSubject && (
                <Button variant="outline" size="sm" onClick={() => onViewSubject(candidature.subject.id)}>
                  View Subject
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm text-slate-700 font-semibold">Motivation</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{candidature.motivation}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-900">Student</p>
                <p>{candidature.student.firstName} {candidature.student.lastName}</p>
                <p>{candidature.student.email}</p>
              </div>
            </div>
            {actionArea && <div>{actionArea(candidature)}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CandidatureList;
