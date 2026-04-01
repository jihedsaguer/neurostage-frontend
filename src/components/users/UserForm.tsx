import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RoleDto, UserDto } from '@/types/user';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: RoleDto[];
}

interface UserFormProps {
  selectedUser: UserDto | null;
  formState: FormState;
  availableRoles: RoleDto[];
  isSubmitting: boolean;
  onChange: (next: FormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

const UserForm = ({
  selectedUser,
  formState,
  availableRoles,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: UserFormProps) => (
  <Card className="mt-6 border-slate-200 shadow-sm">
    <CardHeader className="border-b border-slate-200 px-6 py-4 bg-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{selectedUser ? 'Edit User' : 'Add User'}</CardTitle>
          <CardDescription>
            {selectedUser ? 'Update user details and role assignments.' : 'Create a new user account.'}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <form className="grid gap-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={formState.firstName}
              onChange={(e) => onChange({ ...formState, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={formState.lastName}
              onChange={(e) => onChange({ ...formState, lastName: e.target.value })}
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
              onChange={(e) => onChange({ ...formState, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formState.password}
              onChange={(e) => onChange({ ...formState, password: e.target.value })}
              placeholder={selectedUser ? 'Leave blank to keep current' : 'Create a password'}
              {...(!selectedUser && { required: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roles">Roles</Label>
          <select
            id="roles"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            multiple
            value={formState.roles.map((r) => r.id).filter((id): id is string => !!id)}
            onChange={(e) => {
              const ids = Array.from(e.target.selectedOptions, (o) => o.value);
              onChange({ ...formState, roles: availableRoles.filter((r) => r.id && ids.includes(r.id)) });
            }}
          >
            {availableRoles.map((role) => (
              <option key={role.id ?? role.name} value={role.id ?? role.name}>{role.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {selectedUser ? 'Save changes' : 'Create user'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default UserForm;
