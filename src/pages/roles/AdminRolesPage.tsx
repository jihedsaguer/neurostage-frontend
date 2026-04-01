import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFetchRolesQuery } from '@/redux/features/users/usersApi';

const AdminRolesPage = () => {
  const navigate = useNavigate();
  const { data: roles = [], isLoading, isError } = useFetchRolesQuery();
  const [search, setSearch] = useState('');

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Roles</h1>
          <p className="text-slate-600 mt-1">View and manage system roles and their permissions.</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard')} variant="outline">Back to Dashboard</Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">All Roles</CardTitle>
              <CardDescription>Each role and its associated permissions.</CardDescription>
            </div>
            <input
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Search roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
              Unable to load roles.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Role name</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((role) => (
                  <tr key={role.id}>
                    <td className="px-4 py-4 font-medium text-slate-900">{role.name}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {role.permissions.length > 0
                        ? role.permissions.map((p) => p.name).join(', ')
                        : <span className="text-slate-400 italic">No permissions</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                      {isLoading ? 'Loading roles…' : 'No roles found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRolesPage;
