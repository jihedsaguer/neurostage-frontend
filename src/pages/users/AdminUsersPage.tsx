import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserForm from '@/components/users/UserForm';
import type { RoleDto, UserDto } from '@/types/user';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useFetchRolesQuery,
  useFetchUsersQuery,
  useUpdateUserMutation,
} from '@/redux/features/users/usersApi';

const defaultFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roles: [] as RoleDto[],
};

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading: isLoadingUsers, isError: isUsersError } = useFetchUsersQuery();
  const { data: roles = [], isError: isRolesError } = useFetchRolesQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const error = isUsersError ? 'Unable to load users.' : isRolesError ? 'Unable to load roles.' : undefined;

  const filteredUsers = useMemo(
    () => users.filter((u) => {
      const q = search.toLowerCase();
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }),
    [search, users]
  );

  const openCreate = () => {
    setSelectedUser(null);
    setFormState(defaultFormState);
    setShowForm(true);
  };

  const openEdit = (user: UserDto) => {
    setSelectedUser(user);
    setFormState({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', roles: user.roles });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setFormState(defaultFormState);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      setIsSubmitting(true);
      setDeleteError(null);
      await deleteUser(userId).unwrap();
    } catch (err) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Delete failed')
          : 'Delete failed';
      setDeleteError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      password: formState.password || undefined,
      roleIds: formState.roles.map((r) => r.id).filter((id): id is string => !!id),
    };
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await updateUser({ userId: selectedUser.id, userData: payload }).unwrap();
      } else {
        await createUser(payload).unwrap();
      }
      closeForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and manage users and their role assignments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">Back to Dashboard</Button>
          <Button onClick={openCreate}>Add User</Button>
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
              <Label htmlFor="user-search" className="sr-only">Search users</Label>
              <Input
                id="user-search"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {(error ?? deleteError) && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error ?? deleteError}
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
                      {user.roles.map((r) => r.name).join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 hidden lg:table-cell">
                      {user.roles.flatMap((r) => r.permissions ?? []).map((p) => {
                        if (typeof p === 'string') return p;
                        const obj = p as Record<string, unknown>;
                        return String(obj.action ?? obj.name ?? '');
                      }).filter(Boolean).join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(user.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {isLoadingUsers ? 'Loading users…' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <UserForm
          selectedUser={selectedUser}
          formState={formState}
          availableRoles={roles}
          isSubmitting={isSubmitting}
          onChange={setFormState}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
