
export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
}

export interface RoleDto {
  id: string;
  name: 'admin_service' | 'encadreur_pro' | 'encadreur_acad' | 'student';
  permissions: PermissionDto[];
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: RoleDto[];
}