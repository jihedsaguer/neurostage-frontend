import { useAppSelector } from '@/redux/hooks';

/**
 * Returns true if the current user has the given permission string.
 * Permission strings come from the backend (e.g. "subjects:create").
 */
export function useCanDo(permission: string): boolean {
  const permissions = useAppSelector((state) => state.auth.permissions);
  return permissions.includes(permission);
}
