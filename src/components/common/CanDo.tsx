import type { ReactNode } from 'react';
import { useCanDo } from '@/lib/hooks/useCanDo';

interface CanDoProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the given permission.
 *
 * Usage:
 *   <CanDo permission="subjects:create">
 *     <button>New Subject</button>
 *   </CanDo>
 */
const CanDo = ({ permission, children, fallback = null }: CanDoProps) => {
  const allowed = useCanDo(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default CanDo;
