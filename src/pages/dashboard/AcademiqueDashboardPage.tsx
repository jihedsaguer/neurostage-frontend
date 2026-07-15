import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, CheckSquare, MessageSquare } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useFetchMyStagesAsAcadQuery } from '@/redux/features/stages/stagesApi';

export default function AcademiqueDashboardPage() {
  // Use existing stages query for their assigned stages
  const { data: myStagesData } = useFetchMyStagesAsAcadQuery();
  const myStages = myStagesData ?? [];
  const navigate = useNavigate();

  return (
    <DashboardLayout
      title="Académique Dashboard"
      subtitle="Academic supervision and reporting"
      brandName="Academic Portal"
    >
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Supervised Students</h1>

        {/* Simple stats row */}
        <div className="grid grid-cols-3 gap-4">
          <MetricCard title="Students Supervised" value={myStages?.length ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <MetricCard title="Active Stages" value={myStages?.filter((s: any) => s.status === 'ACTIVE').length ?? 0} icon={Briefcase} iconColor="text-green-600" iconBg="bg-green-50" />
          <MetricCard title="Completed" value={myStages?.filter((s: any) => s.status === 'COMPLETED').length ?? 0} icon={CheckSquare} iconColor="text-purple-600" iconBg="bg-purple-50" />
        </div>

        {/* Student list */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">My Students</h3>
            {myStages?.length === 0 && (
              <p className="text-gray-400 text-sm">No students assigned yet.</p>
            )}
            <div className="space-y-3">
              {myStages?.map((stage: any) => (
                <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{stage.student?.firstName} {stage.student?.lastName}</p>
                    <p className="text-xs text-gray-400">{stage.subject?.title}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/stages/${stage.id}/jalons`)}>
                    View Progress
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RAG chatbot reminder */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-800">AI Assistant Available</p>
              <p className="text-sm text-purple-600">Ask questions about internship procedures and conventions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
