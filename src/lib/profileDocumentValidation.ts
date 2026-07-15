import type { DocumentType } from '@/types/profile.types';

const MB = 1024 * 1024;

const MAX_BYTES: Record<DocumentType, number> = {
  CV: 10 * MB,
  TRANSCRIPT: 10 * MB,
  CERTIFICATE: 10 * MB,
  CIN: 5 * MB,
  OTHER: 10 * MB,
};

const ALLOWED_EXTENSIONS: Record<DocumentType, readonly string[]> = {
  CV: ['.pdf', '.doc', '.docx'],
  TRANSCRIPT: ['.pdf', '.jpg', '.jpeg', '.png'],
  CERTIFICATE: ['.pdf', '.jpg', '.jpeg', '.png'],
  CIN: ['.jpg', '.jpeg', '.png'],
  OTHER: ['.pdf', '.jpg', '.jpeg', '.png'],
};

const TYPE_LABELS: Record<DocumentType, string> = {
  CV: 'CV',
  TRANSCRIPT: 'Transcript',
  CERTIFICATE: 'Certificate',
  CIN: 'CIN',
  OTHER: 'Other',
};

const MAX_MB_LABEL: Record<DocumentType, number> = {
  CV: 10,
  TRANSCRIPT: 10,
  CERTIFICATE: 10,
  CIN: 5,
  OTHER: 10,
};

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return '';
  return name.slice(dot).toLowerCase();
}

export function acceptAttributeForDocumentType(type: DocumentType): string {
  return ALLOWED_EXTENSIONS[type].join(',');
}

export function validateProfileDocument(file: File, type: DocumentType): string | null {
  const maxBytes = MAX_BYTES[type];
  const label = TYPE_LABELS[type];
  const maxMb = MAX_MB_LABEL[type];

  if (file.size > maxBytes) {
    return `File too large. ${label} must be under ${maxMb}MB.`;
  }

  const ext = fileExtension(file.name);
  const allowed = ALLOWED_EXTENSIONS[type];
  if (!ext || !allowed.includes(ext)) {
    const list = allowed.join(', ');
    return `Invalid file type. ${label} accepts: ${list}.`;
  }

  return null;
}
