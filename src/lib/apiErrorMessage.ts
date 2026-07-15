/**
 * User-facing message for failed RTK Query / fetch mutations.
 * Matches common Nest-style `{ message: string }` payloads.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  const e = err as { status?: number; data?: { message?: string | string[] } };
  if (e?.status === 403) {
    return "Accès refusé — vous n'avez pas les droits pour cette ressource ou cette action.";
  }
  if (e?.status === 404) {
    return 'Ressource introuvable.';
  }
  if (e?.status === 409) {
    return "Conflit — l'opération n'est pas possible dans l'état actuel (ex. statut du jalon).";
  }
  const raw = e?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string' && raw.trim()) return raw;
  return fallback;
}
