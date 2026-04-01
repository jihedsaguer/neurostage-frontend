import type { RoleName } from '@/types/user';

export interface NavItem {
  label: string;
  path: string;
  roles: RoleName[];  // which roles can see this item
}

/**
 * Single source of truth for sidebar/nav items.
 * Filter at render time: items.filter(i => i.roles.includes(currentRole))
 */
export const NAV_ITEMS: NavItem[] = [
  // super_admin
  { label: 'Admin Dashboard',  path: '/admin/dashboard',       roles: ['super_admin'] },
  { label: 'Users',            path: '/admin/users',           roles: ['super_admin'] },
  { label: 'Roles',            path: '/admin/roles',           roles: ['super_admin'] },
  { label: 'Permissions',      path: '/admin/permissions',     roles: ['super_admin'] },

  // admin_formation
  { label: 'Formation Dashboard', path: '/formation/dashboard', roles: ['admin_formation'] },

  // encadrant_pro
  { label: 'Encadreur Dashboard', path: '/encadreur/dashboard', roles: ['encadrant_pro'] },

  // encadrant_academique
  { label: 'Académique Dashboard', path: '/academique/dashboard', roles: ['encadrant_academique'] },

  // student
  { label: 'My Dashboard',     path: '/student/dashboard',     roles: ['student'] },
];

export function getNavItems(role: RoleName | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
