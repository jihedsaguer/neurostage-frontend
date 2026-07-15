import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Save, RefreshCw, Sliders, Shield, Mail, Bot, SlidersHorizontal, CloudLightning } from 'lucide-react';

export function AdminSettingsTab() {
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    systemName: 'NeuroStage AI Platform',
    maintenanceMode: false,
    studentRegistration: true,
    sessionTimeout: '60',
    jwtExpiry: '1h',
    minPasswordLength: '8',
    requireSpecialChar: true,
    mailHost: 'sandbox.smtp.mailtrap.io',
    mailPort: '2525',
    mailFrom: 'noreply@neurostage.ai',
    aiEnabled: true,
    aiModel: 'llama3.2',
    chatNotifications: true,
    allowedUploadTypes: '.pdf,.doc,.docx',
    maxUploadSize: '10'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Configuration saved successfully!', {
        description: 'Global business and infrastructure settings updated.'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Save Button Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          <span className="text-xs text-slate-500">Configure global parameters and platform features</span>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* General Settings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-slate-500" />
              General Campaign Settings
            </CardTitle>
            <CardDescription>Main brand attributes and campaign access configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Platform Public Name</Label>
              <Input
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-600">Global Maintenance Mode</Label>
                <p className="text-[10px] text-slate-400">Lock out students and mentors immediately for system updates</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-600">Student Self-Registration</Label>
                <p className="text-[10px] text-slate-400">Allows direct signups on the landing page</p>
              </div>
              <Switch
                checked={settings.studentRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, studentRegistration: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Token Policy */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Security & Authentication Policy
            </CardTitle>
            <CardDescription>Session timings, JWT expiry, and authentication strength policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">JWT Token Lifespan</Label>
                <select
                  value={settings.jwtExpiry}
                  onChange={(e) => setSettings({ ...settings, jwtExpiry: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs"
                >
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">24 Hours</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Session Inactivity Timeout (mins)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Minimum Password Length</Label>
                <Input
                  type="number"
                  value={settings.minPasswordLength}
                  onChange={(e) => setSettings({ ...settings, minPasswordLength: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex justify-between items-center pt-5">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-slate-600">Enforce Complexity</Label>
                  <p className="text-[9px] text-slate-400">Requires numbers/symbols</p>
                </div>
                <Switch
                  checked={settings.requireSpecialChar}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireSpecialChar: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Campaign SMTP Configuration
            </CardTitle>
            <CardDescription>Configure SMTP server settings for dispatching system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-semibold text-slate-600">SMTP Host Outgoing Server</Label>
                <Input
                  value={settings.mailHost}
                  onChange={(e) => setSettings({ ...settings, mailHost: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">SMTP Port</Label>
                <Input
                  value={settings.mailPort}
                  onChange={(e) => setSettings({ ...settings, mailPort: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">From / Sender Address</Label>
              <Input
                type="email"
                value={settings.mailFrom}
                onChange={(e) => setSettings({ ...settings, mailFrom: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI & RAG configuration */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-slate-500" />
              AI Recommendation Model Settings
            </CardTitle>
            <CardDescription>Configure RAG algorithms and LLM context models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-600">AI Subject Matching</Label>
                <p className="text-[10px] text-slate-400">Generate automated suggestions from student profile CV uploads</p>
              </div>
              <Switch
                checked={settings.aiEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
              />
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <Label className="text-xs font-semibold text-slate-600">Active Inference Model</Label>
              <select
                value={settings.aiModel}
                onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                disabled={!settings.aiEnabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs"
              >
                <option value="llama3.2">Ollama - Llama 3.2 (3B Parameters)</option>
                <option value="mistral">Ollama - Mistral-7B (Fast Embeddings)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Cloud API)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Upload Limits & Files settings */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CloudLightning className="h-4 w-4 text-slate-500" />
              File Storage & Limit Settings
            </CardTitle>
            <CardDescription>Configure upload permissions and volume parameters for documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Allowed File Extensions</Label>
                <Input
                  value={settings.allowedUploadTypes}
                  onChange={(e) => setSettings({ ...settings, allowedUploadTypes: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Max File Size Limit (MB)</Label>
                <Input
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
