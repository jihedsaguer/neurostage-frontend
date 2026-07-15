import { useState } from 'react';
import {
  useGetAuditByResourceMutation,
  useGetAuditByUserMutation,
  useGetAuditByActionMutation,
} from '@/redux/features/audit/auditApi';
import type { AuditLog } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, ChevronDown, ChevronRight, SearchX, Loader2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'resource' | 'user' | 'action';

const TABS: { id: TabId; label: string }[] = [
  { id: 'resource', label: 'By Resource' },
  { id: 'user',     label: 'By User' },
  { id: 'action',   label: 'By Action' },
];

const LIMITS = [25, 50, 100] as const;

// ─── Collapsible JSON cell ────────────────────────────────────────────────────

const ChangesCell = ({ changes }: { changes: Record<string, unknown> | null }) => {
  const [open, setOpen] = useState(false);

  if (!changes || Object.keys(changes).length === 0) {
    return <span className="text-slate-400 text-xs italic">—</span>;
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {open ? 'Hide' : 'Show'} changes
      </button>
      {open && (
        <pre className="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-700 overflow-auto max-w-xs max-h-48 whitespace-pre-wrap break-all">
          {JSON.stringify(changes, null, 2)}
        </pre>
      )}
    </div>
  );
};

// ─── Results table ────────────────────────────────────────────────────────────

const ResultsTable = ({ logs, isLoading }: { logs: AuditLog[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        Loading audit logs…
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <SearchX className="h-10 w-10 mb-3" />
        <p className="text-sm font-medium">No audit logs found</p>
        <p className="text-xs mt-1">Try adjusting your search parameters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
            <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">User ID</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Resource Type</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Resource ID</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">Changes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                {new Date(log.createdAt).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs max-w-[120px] truncate" title={log.userId}>
                {log.userId}
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs">{log.resourceType}</td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs max-w-[120px] truncate" title={log.resourceId}>
                {log.resourceId}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                {log.ip ?? <span className="italic text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3">
                <ChangesCell changes={log.changes} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AuditLogsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('resource');
  const [limit, setLimit] = useState<number>(25);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // By Resource
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId]     = useState('');

  // By User
  const [userId, setUserId] = useState('');

  // By Action
  const [action, setAction] = useState('');

  const [getByResource, { isLoading: loadingResource }] = useGetAuditByResourceMutation();
  const [getByUser,     { isLoading: loadingUser }]     = useGetAuditByUserMutation();
  const [getByAction,   { isLoading: loadingAction }]   = useGetAuditByActionMutation();

  const isLoading = loadingResource || loadingUser || loadingAction;

  const handleSearch = async () => {
    setHasSearched(true);
    try {
      let result: AuditLog[] = [];
      if (activeTab === 'resource') {
        result = await getByResource({ resourceType, resourceId, limit }).unwrap();
      } else if (activeTab === 'user') {
        result = await getByUser({ userId, limit }).unwrap();
      } else {
        result = await getByAction({ action, limit }).unwrap();
      }
      setLogs(result);
    } catch {
      setLogs([]);
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setLogs([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
            <p className="text-slate-500 text-sm">Track all system activity and changes</p>
          </div>
        </div>

        {/* Query Card */}
        <Card className="border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">

              {/* By Resource */}
              {activeTab === 'resource' && (
                <>
                  <div className="space-y-1.5 flex-1 min-w-[160px]">
                    <Label htmlFor="resourceType">Resource Type</Label>
                    <Input
                      id="resourceType"
                      placeholder="e.g. subject, user"
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <Label htmlFor="resourceId">Resource ID</Label>
                    <Input
                      id="resourceId"
                      placeholder="UUID"
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* By User */}
              {activeTab === 'user' && (
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="UUID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              )}

              {/* By Action */}
              {activeTab === 'action' && (
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <Label htmlFor="action">Action</Label>
                  <Input
                    id="action"
                    placeholder="e.g. subjects:create"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  />
                </div>
              )}

              {/* Limit */}
              <div className="space-y-1.5">
                <Label htmlFor="limit">Limit</Label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {LIMITS.map((l) => (
                    <option key={l} value={l}>{l} rows</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-10"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(hasSearched || isLoading) && (
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-200 py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Results</CardTitle>
                {!isLoading && (
                  <CardDescription>{logs.length} log{logs.length !== 1 ? 's' : ''} found</CardDescription>
                )}
              </div>
            </CardHeader>
            <ResultsTable logs={logs} isLoading={isLoading} />
          </Card>
        )}

      </div>
    </div>
  );
};

export default AuditLogsPage;
