import {
  FilterState,
  ListingTab,
  SOPActivityItem,
  SOPFileAttachment,
  SOPRecord,
  UserProfile,
} from '../types/sop';

export interface RowActionVisibility {
  canView: boolean;
  canActivity: boolean;
  canEdit: boolean;
  canMakeChanges: boolean;
  canReview: boolean;
}

export function getMySops(sops: SOPRecord[], userEmail: string): SOPRecord[] {
  return sops.filter((s) => s.uploadedByEmail === userEmail);
}

/**
 * Reviewer ONLY: Shows SOPs in Submitted or Resubmitted status uploaded by OTHER users.
 * A Reviewer's own SOPs must NEVER appear in For My Review.
 */
export function getForMyReviewSops(
  sops: SOPRecord[],
  user: UserProfile
): SOPRecord[] {
  if (user.role !== 'Reviewer') return [];
  return sops.filter(
    (s) =>
      s.uploadedByEmail !== user.email &&
      (s.status === 'Submitted' || s.status === 'Resubmitted')
  );
}

export function getRowActionVisibility(
  sop: SOPRecord,
  activeTab: ListingTab,
  currentUser: UserProfile
): RowActionVisibility {
  const isOwner = sop.uploadedByEmail === currentUser.email;
  const isReviewer = currentUser.role === 'Reviewer';

  return {
    canView: true,
    canActivity: true,
    canEdit:
      activeTab === 'my-sops' &&
      isOwner &&
      (sop.status === 'Draft' || sop.status === 'Modification In Progress'),
    canMakeChanges:
      activeTab === 'my-sops' &&
      isOwner &&
      sop.status === 'Requested Modification',
    canReview:
      activeTab === 'for-review' &&
      isReviewer &&
      !isOwner &&
      (sop.status === 'Submitted' || sop.status === 'Resubmitted'),
  };
}

export function filterSops(sops: SOPRecord[], filters: FilterState): SOPRecord[] {
  const q = filters.search.trim().toLowerCase();
  return sops
    .filter((sop) => {
      if (q) {
        const matchName = sop.name.toLowerCase().includes(q);
        const matchId = sop.id.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      if (filters.category && sop.category !== filters.category) return false;
      if (filters.subCategory && sop.subCategory !== filters.subCategory)
        return false;
      if (filters.status && sop.status !== filters.status) return false;

      if (filters.fromDate) {
        const from = new Date(`${filters.fromDate}T00:00:00`).getTime();
        if (new Date(sop.createdAt).getTime() < from) return false;
      }
      if (filters.toDate) {
        const to = new Date(`${filters.toDate}T23:59:59.999`).getTime();
        if (new Date(sop.createdAt).getTime() > to) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);

  if (totalItems === 0) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: safePageSize,
      startIndex: 0,
      endIndex: 0,
    };
  }

  const startOffset = (currentPage - 1) * safePageSize;
  const sliced = items.slice(startOffset, startOffset + safePageSize);

  return {
    items: sliced,
    totalItems,
    totalPages,
    currentPage,
    pageSize: safePageSize,
    startIndex: startOffset + 1,
    endIndex: startOffset + sliced.length,
  };
}

export function validateSopFileExtension(
  fileName: string
): { ok: true; extension: 'pdf' | 'doc' | 'docx' } | { ok: false; error: string } {
  const trimmed = fileName.trim();
  const ext = trimmed.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
    return { ok: true, extension: ext };
  }
  return {
    ok: false,
    error: `Unsupported file format ".${ext || 'unknown'}". Only .doc, .docx, and .pdf files are permitted.`,
  };
}

export interface SopFormPayload {
  name: string;
  category: string;
  subCategory: string;
  comments: string;
  file: SOPFileAttachment;
  fileReplaced: boolean;
}

export interface FormValidationErrors {
  file?: string;
  name?: string;
  category?: string;
  subCategory?: string;
}

export function validateSopFormFields(fields: {
  file: SOPFileAttachment | null;
  name: string;
  category: string;
  subCategory: string;
}): FormValidationErrors {
  const errors: FormValidationErrors = {};
  if (!fields.file) {
    errors.file = 'SOP document file is mandatory (.doc, .docx, or .pdf).';
  }
  if (!fields.name.trim()) {
    errors.name = 'SOP name is mandatory.';
  } else if (fields.name.trim().length < 4) {
    errors.name = 'SOP name must be at least 4 characters.';
  }
  if (!fields.category.trim()) {
    errors.category = 'Category is mandatory.';
  }
  if (!fields.subCategory.trim()) {
    errors.subCategory = 'Sub-category is mandatory.';
  }
  return errors;
}

export function generateNextSopId(existing: SOPRecord[]): string {
  let maxNum = 0;
  for (const sop of existing) {
    const match = sop.id.match(/SOP-GRAP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `SOP-GRAP-${String(maxNum + 1).padStart(3, '0')}`;
}

export function applyMakeChangesTransition(
  sops: SOPRecord[],
  sopId: string,
  user: UserProfile,
  nowIso: string
): SOPRecord[] {
  const target = sops.find((s) => s.id === sopId);
  if (
    !target ||
    target.uploadedByEmail !== user.email ||
    target.status !== 'Requested Modification'
  ) {
    return sops;
  }

  const activity: SOPActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    action: 'Modification Started',
    doneByName: user.name,
    doneByEmail: user.email,
    statusBefore: 'Requested Modification',
    statusAfter: 'Modification In Progress',
  };

  return sops.map((s) =>
    s.id === sopId
      ? {
          ...s,
          status: 'Modification In Progress',
          updatedAt: nowIso,
          activities: [activity, ...s.activities],
        }
      : s
  );
}

export function applySaveSop(
  sops: SOPRecord[],
  payload: SopFormPayload,
  user: UserProfile,
  nowIso: string,
  sopIdToEdit?: string
): { nextSops: SOPRecord[]; savedSopId: string } {
  if (!sopIdToEdit) {
    const newId = generateNextSopId(sops);
    const activity: SOPActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      action: 'Created',
      doneByName: user.name,
      doneByEmail: user.email,
      statusBefore: null,
      statusAfter: 'Draft',
      remarks: payload.comments || undefined,
      versionBadge: 'v1',
    };

    const newSop: SOPRecord = {
      id: newId,
      name: payload.name,
      version: 1,
      category: payload.category,
      subCategory: payload.subCategory,
      status: 'Draft',
      uploadedByName: user.name,
      uploadedByEmail: user.email,
      createdAt: nowIso,
      updatedAt: nowIso,
      comments: payload.comments,
      file: payload.file,
      activities: [activity],
    };

    return { nextSops: [newSop, ...sops], savedSopId: newId };
  }

  const existing = sops.find((s) => s.id === sopIdToEdit);
  if (!existing) return { nextSops: sops, savedSopId: sopIdToEdit };

  const activity: SOPActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    action: 'Saved',
    doneByName: user.name,
    doneByEmail: user.email,
    statusBefore: existing.status,
    statusAfter: existing.status,
    remarks: payload.comments || undefined,
    versionBadge: payload.fileReplaced ? `v${existing.version}` : undefined,
  };

  const nextSops = sops.map((s) =>
    s.id === sopIdToEdit
      ? {
          ...s,
          name: payload.name,
          category: payload.category,
          subCategory: payload.subCategory,
          comments: payload.comments,
          file: payload.file,
          documentContent: payload.fileReplaced ? undefined : s.documentContent,
          updatedAt: nowIso,
          activities: [activity, ...s.activities],
        }
      : s
  );

  return { nextSops, savedSopId: sopIdToEdit };
}

export function applySaveAndSubmitSop(
  sops: SOPRecord[],
  payload: SopFormPayload,
  user: UserProfile,
  nowIso: string,
  sopIdToEdit?: string
): {
  nextSops: SOPRecord[];
  submittedSopId: string;
  isResubmission: boolean;
  previousVersion: number;
  nextVersion: number;
} {
  if (!sopIdToEdit) {
    const newId = generateNextSopId(sops);
    const activity: SOPActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      action: 'Submitted',
      doneByName: user.name,
      doneByEmail: user.email,
      statusBefore: 'Draft',
      statusAfter: 'Submitted',
      remarks: payload.comments || undefined,
      versionBadge: 'v1',
    };

    const newSop: SOPRecord = {
      id: newId,
      name: payload.name,
      version: 1,
      category: payload.category,
      subCategory: payload.subCategory,
      status: 'Submitted',
      uploadedByName: user.name,
      uploadedByEmail: user.email,
      createdAt: nowIso,
      updatedAt: nowIso,
      comments: payload.comments,
      file: payload.file,
      activities: [activity],
    };

    return {
      nextSops: [newSop, ...sops],
      submittedSopId: newId,
      isResubmission: false,
      previousVersion: 1,
      nextVersion: 1,
    };
  }

  const existing = sops.find((s) => s.id === sopIdToEdit);
  if (!existing) {
    return {
      nextSops: sops,
      submittedSopId: sopIdToEdit,
      isResubmission: false,
      previousVersion: 1,
      nextVersion: 1,
    };
  }

  const isResubmission = existing.status === 'Modification In Progress';
  const nextVersion = isResubmission ? existing.version + 1 : existing.version;
  const nextStatus = isResubmission ? 'Resubmitted' : 'Submitted';
  const versionBadge = isResubmission
    ? `v${existing.version} → v${nextVersion}`
    : payload.fileReplaced
    ? `v${nextVersion}`
    : undefined;

  const activity: SOPActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    action: isResubmission ? 'Resubmitted' : 'Submitted',
    doneByName: user.name,
    doneByEmail: user.email,
    statusBefore: existing.status,
    statusAfter: nextStatus,
    remarks: payload.comments || undefined,
    versionBadge,
  };

  const nextSops = sops.map((s) =>
    s.id === sopIdToEdit
      ? {
          ...s,
          name: payload.name,
          version: nextVersion,
          category: payload.category,
          subCategory: payload.subCategory,
          status: nextStatus as SOPRecord['status'],
          comments: payload.comments,
          file: payload.file,
          documentContent: payload.fileReplaced ? undefined : s.documentContent,
          updatedAt: nowIso,
          activities: [activity, ...s.activities],
        }
      : s
  );

  return {
    nextSops,
    submittedSopId: sopIdToEdit,
    isResubmission,
    previousVersion: existing.version,
    nextVersion,
  };
}

export function applyReviewDecision(
  sops: SOPRecord[],
  sopId: string,
  decision: 'Approved' | 'Requested Modification' | 'Rejected',
  remarks: string,
  reviewer: UserProfile,
  nowIso: string
): { ok: true; nextSops: SOPRecord[] } | { ok: false; error: string } {
  if (reviewer.role !== 'Reviewer') {
    return { ok: false, error: 'Only Reviewer users can perform review actions.' };
  }
  const target = sops.find((s) => s.id === sopId);
  if (!target) {
    return { ok: false, error: 'SOP record not found.' };
  }
  if (target.uploadedByEmail === reviewer.email) {
    return { ok: false, error: 'Reviewers cannot review their own SOPs.' };
  }
  if (target.status !== 'Submitted' && target.status !== 'Resubmitted') {
    return {
      ok: false,
      error: 'Only Submitted or Resubmitted SOPs can be reviewed.',
    };
  }
  if (
    (decision === 'Requested Modification' || decision === 'Rejected') &&
    !remarks.trim()
  ) {
    return {
      ok: false,
      error: 'Remarks are mandatory for Request Modification and Reject.',
    };
  }

  const actionType =
    decision === 'Approved'
      ? 'Approved'
      : decision === 'Requested Modification'
      ? 'Modification Requested'
      : 'Rejected';

  const activity: SOPActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    action: actionType,
    doneByName: reviewer.name,
    doneByEmail: reviewer.email,
    statusBefore: target.status,
    statusAfter: decision,
    remarks: remarks.trim() || undefined,
  };

  const nextSops = sops.map((s) =>
    s.id === sopId
      ? {
          ...s,
          status: decision,
          latestReviewerRemarks: remarks.trim() || s.latestReviewerRemarks,
          latestReviewedBy: reviewer.name,
          updatedAt: nowIso,
          activities: [activity, ...s.activities],
        }
      : s
  );

  return { ok: true, nextSops };
}
