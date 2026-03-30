import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/features/users/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RoleDto, UserDto } from '@/features/users/types/user';

const defaultFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roles: [] as RoleDto[],
};

const AdminUsersPage = () => {
  const {
    users,
    roles,
    isLoading,
    error,
    fetchAllUsers,
    loadRoles,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const filteredUsers = useMemo(
    () => users.filter((user) => {
      const query = search.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }),
    [search, users]
  );

  const resetForm = () => {
    setSelectedUser(null);
    setFormState(defaultFormState);
    setShowForm(true);
  };

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user);
    setFormState({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      roles: user.roles,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteUser(userId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        password: formState.password || undefined,
        roleIds: formState.roles.map((role) => role.id),
      };

      if (selectedUser) {
        await updateUser(selectedUser.id, payload);
      } else {
        await createUser(payload);
      }

      setShowForm(false);
      setSelectedUser(null);
      setFormState(defaultFormState);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRoles = roles.length > 0 ? roles : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and manage users and their role assignments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Back to Admin Dashboard
          </Button>
          <Button onClick={resetForm}>Add User</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="space-y-2 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Users</CardTitle>
              <CardDescription>Search users and manage their roles and status.</CardDescription>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
              <Label htmlFor="user-search" className="sr-only">
                Search users
              </Label>
              <Input
                id="user-search"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Roles</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Permissions</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 font-medium text-slate-900">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-4 text-slate-600">{user.email}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {user.isActive ? 'Active' : 'Inactive'} / {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 hidden sm:table-cell">
                      {user.roles.map((role) => role.name).join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 hidden lg:table-cell">
                      {user.roles.flatMap((role) => role.permissions.map((permission) => permission.name)).join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(user.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {isLoading ? 'Loading users…' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mt-6 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 px-6 py-4 bg-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{selectedUser ? 'Edit User' : 'Add User'}</CardTitle>
                <CardDescription>{selectedUser ? 'Update user details and role assignments.' : 'Create a new user account.'}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setShowForm(false); setSelectedUser(null); setFormState(defaultFormState); }}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={formState.firstName}
                    onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={formState.lastName}
                    onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                    placeholder={selectedUser ? 'Leave blank to keep current password' : 'Create a password'}
                    {...(!selectedUser && { required: true })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roles">Roles</Label>
                  <select
                    id="roles"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    multiple
                    value={formState.roles.map((role) => role.id)}
                    onChange={(event) => {
                      const selectedIds = Array.from(event.target.selectedOptions, (option) => option.value);
                      const selectedRoles = availableRoles.filter((role) => selectedIds.includes(role.id));
                      setFormState((current) => ({ ...current, roles: selectedRoles }));
                    }}
                  >
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {selectedUser ? 'Save changes' : 'Create user'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setSelectedUser(null); setFormState(defaultFormState); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
