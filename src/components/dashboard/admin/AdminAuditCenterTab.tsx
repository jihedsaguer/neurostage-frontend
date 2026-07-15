import { useState } from 'react';
import { useGetAuditLogsQuery } from '@/redux/features/audit/auditApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, FileDown, Calendar, ArrowLeft, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import type { AuditLog } from '@/types/audit';

export function AdminAuditCenterTab() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // RTK Query fetches data reactively as states change
  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    action: action.trim() || undefined,
    resourceType: resourceType.trim() || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const getActionBadgeColor = (actionName: string) => {
    const act = actionName.toUpperCase();
    if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-red-50 text-red-700 border-red-200';
    if (act.includes('CREATE') || act.includes('VALID') || act.includes('APPROVE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('UPDATE') || act.includes('MODIFY')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const handleExport = () => {
    // Generate simple CSV from current page logs
    if (!data?.data || data.data.length === 0) return;
    
    const headers = ['ID', 'Timestamp', 'Action', 'Operator', 'Resource Type', 'Resource ID', 'IP', 'User Agent'];
    const rows = data.data.map(log => [
      log.id,
      log.createdAt,
      log.action,
      log.userId,
      log.resourceType,
      log.resourceId,
      log.ip ?? '',
      log.userAgent ?? ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neurostage_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filtering Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Log Filtering & Query Console</CardTitle>
            <CardDescription>Search the full database audit log using targeted parameters</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-8">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!data?.data || data.data.length === 0} className="h-8">
              <FileDown className="h-3.5 w-3.5 mr-1" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            {/* Search */}
            <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-1">
              <Label className="text-xs font-semibold text-slate-500">General Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Keyword, ID, User UUID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            {/* Action */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Action Type</Label>
              <Input
                placeholder="e.g. CREATE_SUBJECT"
                value={action}
                onChange={(e) => { setAction(e.target.value); setPage(1); }}
                className="h-9 text-xs"
              />
            </div>

            {/* Resource Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Resource Category</Label>
              <Input
                placeholder="e.g. Subject, Stage"
                value={resourceType}
                onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
                className="h-9 text-xs"
              />
            </div>

            {/* From Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Since Date
              </Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="h-9 text-xs"
              />
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Until Date
              </Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Operator (User ID)</th>
                <th className="px-4 py-3">Resource Type</th>
                <th className="px-4 py-3">Resource ID</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 bg-white">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors font-mono">
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <Badge variant="outline" className={`font-semibold tracking-wide ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 truncate max-w-[120px]" title={log.userId}>{log.userId}</td>
                    <td className="px-4 py-3.5 font-sans font-medium text-slate-700">{log.resourceType}</td>
                    <td className="px-4 py-3.5 truncate max-w-[120px]" title={log.resourceId}>{log.resourceId}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{log.ip ?? 'System'}</td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-7 text-xs px-2 hover:bg-slate-100">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    No matching audit trail events were found in the archive database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 flex-wrap gap-2 text-xs">
            <div className="text-slate-500">
              Showing page <strong className="text-slate-700">{page}</strong> of <strong className="text-slate-700">{data.totalPages}</strong> ({data.total} total logs)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-2.5"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="h-8 px-2.5"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspect Log details Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-2xl font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`font-semibold tracking-wide ${getActionBadgeColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">{selectedLog.id}</span>
              </div>
              <DialogTitle className="text-base font-semibold">Audit Event Deep Inspection</DialogTitle>
              <DialogDescription>
                Triggered on {new Date(selectedLog.createdAt).toLocaleString()} by operator {selectedLog.userId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs border-t border-b border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Resource Type</span>
                  <span className="text-slate-800">{selectedLog.resourceType}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Resource Identifier (UUID)</span>
                  <span className="font-mono text-slate-800 break-all">{selectedLog.resourceId}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Origin IP Address</span>
                  <span className="text-slate-800">{selectedLog.ip ?? 'System Internals'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">User Agent Client</span>
                  <span className="text-slate-800 truncate block" title={selectedLog.userAgent ?? ''}>{selectedLog.userAgent ?? 'System Context'}</span>
                </div>
              </div>

              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 ? (
                <div>
                  <span className="font-semibold text-slate-500 block mb-2">Recorded State Mutation (JSON)</span>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-auto font-mono text-[11px] leading-relaxed max-h-64 whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 p-4 text-center rounded-lg text-slate-400 italic">
                  No state mutation was captured for this event.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedLog(null)} size="sm">Dismiss Inspect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
