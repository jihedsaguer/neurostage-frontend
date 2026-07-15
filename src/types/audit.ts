export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string; 
}