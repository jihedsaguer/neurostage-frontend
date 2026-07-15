export type RoleName =
  | 'super_admin'
  | 'admin_formation'
  | 'encadrant_pro'
  | 'encadrant_academique'
  | 'student';

export interface PermissionDto {
  id?: string;
  name?: string;
  description?: string;
}

export interface RoleDto {
  id?: string;
  name: RoleName;
  permissions?: string[];
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  roles: RoleDto[];
  permissions?: string[];
  profile?: {
    isAiProcessed?: boolean;
    university?: string | null;
    level?: string | null;
  };
}
