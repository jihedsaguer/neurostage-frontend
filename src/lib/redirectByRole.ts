import type { RoleDto } from '../features/users/types/user';

export function getRedirectPath(roles: RoleDto[]): string {
  const roleNames = roles.map((r) => r.name);
  if(roleNames.includes('admin_service')) {
    return '/admin/dashboard';
    } else if(roleNames.includes('encadreur_pro') || roleNames.includes('encadreur_acad')) {
        return '/user/dashboard';
    } else if(roleNames.includes('student')) {
        return '/user/dashboard';
    }
    return '/dashboard';
}
