import { useAppSelector } from '@/redux/hooks';
import type { RoleName } from '@/types/user';

export function useAiFeatures() {
  const user = useAppSelector((s) => s.auth.user);
  const authRole = useAppSelector((s) => s.auth.role);
  const role = (user?.roles?.[0]?.name ?? authRole) as RoleName | null;

  return {
    canGenerateDraft: role === 'encadrant_pro' || role === 'admin_formation',
    canIngestDocuments: role === 'admin_formation' || role === 'super_admin',
    canViewSuggestions: role === 'student',
    canUseRag: !!role,
    isEncadreurAcademique: role === 'encadrant_academique',
  };
}
