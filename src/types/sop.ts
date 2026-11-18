export type PersonaRole = 'Maker' | 'Reviewer' | 'Unassigned';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: PersonaRole;
  designation: string;
  department: string;
  employeeCode: string;
}

export type SOPStatus =
  | 'Draft'
  | 'Submitted'
  | 'Requested Modification'
  | 'Modification In Progress'
  | 'Resubmitted'
  | 'Approved'
  | 'Rejected';

export type SOPActionType =
  | 'Created'
  | 'Saved'
  | 'Submitted'
  | 'Modification Requested'
  | 'Modification Started'
  | 'Resubmitted'
  | 'Approved'
  | 'Rejected';

export interface SOPFileAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  extension: 'pdf' | 'doc' | 'docx';
  dataUrl: string | null;
  uploadedAt: string;
}

export interface SOPDocumentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface SOPDocumentContent {
  documentCode: string;
  effectiveDate: string;
  ownerUnit: string;
  classification: string;
  objective: string;
  scope: string;
  sections: SOPDocumentSection[];
}

export interface SOPActivityItem {
  id: string;
  timestamp: string;
  action: SOPActionType;
  doneByName: string;
  doneByEmail: string;
  statusBefore: SOPStatus | null;
  statusAfter: SOPStatus;
  remarks?: string;
  versionBadge?: string;
}

export interface SOPRecord {
  id: string;
  name: string;
  version: number;
  category: string;
  subCategory: string;
  status: SOPStatus;
  uploadedByName: string;
  uploadedByEmail: string;
  createdAt: string;
  updatedAt: string;
  comments: string;
  latestReviewerRemarks?: string;
  latestReviewedBy?: string;
  file: SOPFileAttachment;
  documentContent?: SOPDocumentContent;
  activities: SOPActivityItem[];
}

export type ActiveScreen =
  | { name: 'listing' }
  | { name: 'add' }
  | { name: 'edit'; sopId: string }
  | { name: 'review'; sopId: string };

export type ListingTab = 'my-sops' | 'for-review';

export interface FilterState {
  search: string;
  category: string;
  subCategory: string;
  status: string;
  fromDate: string;
  toDate: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
