import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Key, Globe, Eye, Server, Lock, Radio } from 'lucide-react';
import { useState } from 'react';

export function AdminSecurityCenterTab() {
  const [keysRevealed, setKeysRevealed] = useState(false);

  // Mock telemetry data
  const securityStats = {
    jwtExpiration: '3600 seconds (1 hour)',
    rateLimitRemaining: '996 / 1000 requests',
    failedLoginsToday: 3,
    activeSessions: 18,
    accountLocksToday: 0
  };

  const envVariables = [
    { key: 'VITE_API_URL', value: 'http://localhost/api', type: 'Frontend Endpt' },
    { key: 'JWT_SECRET', value: 'neurostage_secret_signature_jwt_token_development_2026', type: 'Crypt Signature' },
    { key: 'AI_SERVICE_URL', value: 'http://neurostage_ai:8001', type: 'Intra AI Endpoint' },
    { key: 'CORS_ORIGIN', value: 'http://localhost:5173', type: 'CORS Policy whitelist' }
  ];

  // RBAC Permission Matrix
  const rbacMatrix = [
    { role: 'super_admin', subjects: 'Full (CRUD)', candidatures: 'Full (CRUD)', stages: 'Full (CRUD)', system: 'Manage' },
    { role: 'admin_formation', subjects: 'Read/Write/Validate', candidatures: 'Read/Assign', stages: 'Read/Manage', system: 'No' },
    { role: 'encadrant_pro', subjects: 'Create/Draft', candidatures: 'Review My', stages: 'Manage My', system: 'No' },
    { role: 'encadrant_academique', subjects: 'Read Only', candidatures: 'Read Only', stages: 'Manage My', system: 'No' },
    { role: 'student', subjects: 'Read (Validated)', candidatures: 'Propose/Apply', stages: 'Read My', system: 'No' }
  ];

  return (
    <div className="space-y-6">
      {/* Security Health banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Authentication State</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">JWT / Bcrypt-256</p>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1 font-normal text-[10px]">
                Highly Secure
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Session Policy</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">Secure Refresh Token</p>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1 font-normal text-[10px]">
                Token Rotation
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Failed Authentication</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{securityStats.failedLoginsToday} attempts today</p>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1 font-normal text-[10px]">
                Under Threshold
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Rate Limiting API</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{securityStats.rateLimitRemaining}</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1 font-normal text-[10px]">
                Protected Gateway
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environment variables (masked) */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-500" />
                API & Environment Secrets
              </CardTitle>
              <CardDescription>Masked runtime properties for connected networks</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setKeysRevealed(!keysRevealed)}
              className="text-xs h-8"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              {keysRevealed ? 'Mask Secrets' : 'Reveal Secrets'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-xs">
              {envVariables.map((variable) => (
                <div key={variable.key} className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700">{variable.key}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">{variable.type}</span>
                  </div>
                  <span className="text-slate-500 max-w-md truncate bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                    {keysRevealed ? variable.value : '••••••••••••••••••••••••••••••••'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auth policy config overview */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              Active Encryption Policy
            </CardTitle>
            <CardDescription>System access policy parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">JWT Token Expiry</span>
                <span className="font-semibold text-slate-800">{securityStats.jwtExpiration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Encryption Cost</span>
                <span className="font-semibold text-slate-800">10 Salt Rounds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Token Signature</span>
                <span className="font-semibold text-slate-800">HMAC SHA256</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Dual Cookies</span>
                <span className="font-semibold text-slate-800 text-emerald-600">Enabled (HttpOnly)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">CORS Whitelist</span>
                <span className="font-semibold text-slate-800">Localhost Strict</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RBAC matrix */}
        <Card className="border-slate-200 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-500" />
              Role-Based Access Control (RBAC) Matrix
            </CardTitle>
            <CardDescription>Operational boundaries and clearance tiers configured in auth module</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Security Role Name</th>
                  <th className="px-4 py-3">Internship Subjects</th>
                  <th className="px-4 py-3">Candidatures</th>
                  <th className="px-4 py-3">Internship Stages</th>
                  <th className="px-4 py-3">Administration Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
                {rbacMatrix.map((tier) => (
                  <tr key={tier.role} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{tier.role}</td>
                    <td className="px-4 py-3.5">{tier.subjects}</td>
                    <td className="px-4 py-3.5">{tier.candidatures}</td>
                    <td className="px-4 py-3.5">{tier.stages}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className={tier.system === 'Manage' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}>
                        {tier.system}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
