import type { ReactNode } from 'react';
import type { RoleName } from '@/types/user';
import { NavIcons } from './navIcons';

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: RoleName[];  // which roles can see this item
}

/**
 * Single source of truth for sidebar/nav items.
 * Filter at render time: items.filter(i => i.roles.includes(currentRole))
 */
export const NAV_ITEMS: NavItem[] = [
  // super_admin
  { label: 'Overview', path: '/admin/dashboard', icon: NavIcons.dashboard, roles: ['super_admin'] },
  { label: 'Users', path: '/admin/users', icon: NavIcons.users, roles: ['super_admin'] },
  { label: 'Roles', path: '/admin/roles', icon: NavIcons.roles, roles: ['super_admin'] },
  { label: 'Permissions', path: '/admin/permissions', icon: NavIcons.permissions, roles: ['super_admin'] },
  { label: 'Subjects', path: '/subjects', icon: NavIcons.subjects, roles: ['super_admin'] },
  { label: 'Candidatures', path: '/admin/candidatures', icon: NavIcons.subjects, roles: ['super_admin'] },
  { label: 'Audit Logs',   path: '/admin/audit',         icon: NavIcons.audit,    roles: ['super_admin'] },
  { label: 'Stages',       path: '/admin/stages',        icon: NavIcons.stages,   roles: ['super_admin'] },
  { label: 'Knowledge Base', path: '/formation/knowledge-base', icon: NavIcons.subjects, roles: ['super_admin'] },
  { label: 'Messagerie',   path: '/chat',                icon: NavIcons.chat,     roles: ['super_admin'] },

  // admin_formation
  { label: 'Overview', path: '/formation/dashboard', icon: NavIcons.dashboard, roles: ['admin_formation'] },
  { label: 'Subjects', path: '/subjects', icon: NavIcons.subjects, roles: ['admin_formation'] },
  { label: 'Candidatures', path: '/admin/candidatures', icon: NavIcons.subjects, roles: ['admin_formation'] },
  { label: 'Audit Logs',   path: '/admin/audit',         icon: NavIcons.audit,    roles: ['admin_formation'] },
  { label: 'Stages',       path: '/admin/stages',        icon: NavIcons.stages,   roles: ['admin_formation'] },
  { label: 'Knowledge Base', path: '/formation/knowledge-base', icon: NavIcons.subjects, roles: ['admin_formation'] },
  { label: 'Messagerie',   path: '/chat',                icon: NavIcons.chat,     roles: ['admin_formation'] },

  // encadrant_pro
  { label: 'Overview', path: '/encadreur/dashboard', icon: NavIcons.dashboard, roles: ['encadrant_pro'] },
  { label: 'My Stages', path: '/pro/stages', icon: NavIcons.stages, roles: ['encadrant_pro'] },
  { label: 'Subjects', path: '/subjects', icon: NavIcons.subjects, roles: ['encadrant_pro'] },
  { label: 'Messagerie', path: '/chat', icon: NavIcons.chat, roles: ['encadrant_pro'] },

  // encadrant_academique
  { label: 'Overview', path: '/academique/dashboard', icon: NavIcons.dashboard, roles: ['encadrant_academique'] },
  { label: 'My Stages', path: '/acad/stages', icon: NavIcons.stages, roles: ['encadrant_academique'] },
  { label: 'Subjects', path: '/subjects', icon: NavIcons.subjects, roles: ['encadrant_academique'] },
  { label: 'Messagerie', path: '/chat', icon: NavIcons.chat, roles: ['encadrant_academique'] },

  // student
  { label: 'My Dashboard',    path: '/student/dashboard', icon: NavIcons.dashboard, roles: ['student'] },
  { label: 'Browse Subjects', path: '/subjects',          icon: NavIcons.subjects,  roles: ['student'] },
  { label: 'My Profile',      path: '/profile',           icon: NavIcons.profile,   roles: ['student'] },
  { label: 'Mon Stage',       path: '/student/stage',     icon: NavIcons.stages,    roles: ['student'] },
  { label: 'Messagerie',      path: '/chat',              icon: NavIcons.chat,      roles: ['student'] },
];

export function getNavItems(role: RoleName | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
