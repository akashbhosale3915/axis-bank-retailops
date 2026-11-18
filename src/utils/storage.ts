import { SEED_SOPS } from '../data/seedData';
import { SOPFileAttachment, SOPRecord, UserProfile } from '../types/sop';
import { validateSopFileExtension } from './sopRules';

const SOPS_STORAGE_KEY = 'axis_grap_sops_v2';
const USER_STORAGE_KEY = 'axis_grap_active_user_v1';

export function loadSOPs(): SOPRecord[] {
  try {
    const raw = localStorage.getItem(SOPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SOPS_STORAGE_KEY, JSON.stringify(SEED_SOPS));
      return structuredClone(SEED_SOPS);
    }
    const parsed = JSON.parse(raw) as SOPRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SOPS_STORAGE_KEY, JSON.stringify(SEED_SOPS));
      return structuredClone(SEED_SOPS);
    }
    return parsed;
  } catch {
    localStorage.setItem(SOPS_STORAGE_KEY, JSON.stringify(SEED_SOPS));
    return structuredClone(SEED_SOPS);
  }
}

export function saveSOPs(sops: SOPRecord[]): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(SOPS_STORAGE_KEY, JSON.stringify(sops));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        'Browser storage quota exceeded (uploaded file is too large for localStorage). Please use a file under 3 MB or reset demo data.',
    };
  }
}

export function resetDemoData(): SOPRecord[] {
  const fresh = structuredClone(SEED_SOPS);
  localStorage.setItem(SOPS_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function loadActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    if (raw === 'SIGNED_OUT') {
      return null;
    }
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveActiveUser(user: UserProfile | null): void {
  if (user === null) {
    localStorage.setItem(USER_STORAGE_KEY, 'SIGNED_OUT');
  } else {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateAndReadSopFile(
  file: File
): Promise<{ ok: true; attachment: SOPFileAttachment } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const fileName = file.name.trim();
    const extCheck = validateSopFileExtension(fileName);
    if (!extCheck.ok) {
      resolve({ ok: false, error: extCheck.error });
      return;
    }

    if (file.size > 3.5 * 1024 * 1024) {
      resolve({
        ok: false,
        error:
          'File exceeds 3.5 MB client-storage limit. Please select a smaller .pdf, .doc, or .docx document.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        ok: true,
        attachment: {
          fileName,
          fileSize: file.size,
          fileType:
            file.type ||
            (extCheck.extension === 'pdf'
              ? 'application/pdf'
              : 'application/msword'),
          extension: extCheck.extension,
          dataUrl: typeof reader.result === 'string' ? reader.result : null,
          uploadedAt: new Date().toISOString(),
        },
      });
    };
    reader.onerror = () => {
      resolve({
        ok: false,
        error: 'Unable to read the selected file. Please try again.',
      });
    };
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlobUrl(dataUrl: string): string | null {
  try {
    const [header, base64] = dataUrl.split(',');
    if (!base64) return null;
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
