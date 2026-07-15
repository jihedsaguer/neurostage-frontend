/**
 * Utility helpers for the Jalons & Livrables feature.
 */

/**
 * Format a raw byte count into a human-readable string (KB / MB).
 * Stays below 30 words per source for compliance.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

/**
 * Compute the SHA-256 hex digest of a File using the Web Crypto API.
 * This is used client-side before submitting a livrable so the server
 * can verify file integrity without storing the raw file locally.
 */
export async function computeFileSha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
