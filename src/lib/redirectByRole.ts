import type { RoleName } from '@/types/user';

export const ROLE_LANDING: Record<RoleName, string> = {
  super_admin:           '/admin/dashboard',
  admin_formation:       '/formation/dashboard',
  encadrant_pro:         '/encadreur/dashboard',
  encadrant_academique:  '/academique/dashboard',
  student:               '/student/dashboard',
};

export function getRedirectPath(role: RoleName | string | undefined): string {
  if (!role) return '/login';
  return ROLE_LANDING[role as RoleName] ?? '/login';
}
