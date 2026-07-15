import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverviewTab } from '@/components/dashboard/admin/AdminOverviewTab';
import { AdminAnalyticsTab } from '@/components/dashboard/admin/AdminAnalyticsTab';
import { AdminAuditCenterTab } from '@/components/dashboard/admin/AdminAuditCenterTab';
import { AdminSecurityCenterTab } from '@/components/dashboard/admin/AdminSecurityCenterTab';
import { AdminMonitoringTab } from '@/components/dashboard/admin/AdminMonitoringTab';
import { AdminSettingsTab } from '@/components/dashboard/admin/AdminSettingsTab';
import { useState } from 'react';
import { LayoutDashboard, BarChart2, ShieldCheck, Activity, Settings, ClipboardList } from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout title="Admin Workspace" subtitle="Manage configuration, monitor logs and service health" brandName="Admin Portal">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Workspace Tabs Navigation Bar */}
          <div className="flex border-b border-slate-200 pb-px overflow-x-auto scrollbar-none">
            <TabsList className="bg-transparent border-0 h-auto p-0 flex gap-6 shrink-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <BarChart2 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <ClipboardList className="h-4 w-4" />
                Audit Center
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Security Center
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 text-sm font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5 transition-all"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Workspace Tab Contents */}
          <TabsContent value="overview" className="mt-0 outline-none">
            <AdminOverviewTab setActiveTab={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0 outline-none">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="audit" className="mt-0 outline-none">
            <AdminAuditCenterTab />
          </TabsContent>

          <TabsContent value="security" className="mt-0 outline-none">
            <AdminSecurityCenterTab />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-0 outline-none">
            <AdminMonitoringTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;