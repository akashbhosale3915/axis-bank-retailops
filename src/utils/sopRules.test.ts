import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_SOPS, SSO_PERSONAS } from '../data/seedData';
import {
  applyMakeChangesTransition,
  applyReviewDecision,
  applySaveAndSubmitSop,
  applySaveSop,
  filterSops,
  getForMyReviewSops,
  getMySops,
  getRowActionVisibility,
  paginateItems,
  validateSopFileExtension,
  validateSopFormFields,
} from './sopRules';

const maker = SSO_PERSONAS[0]; // Ananya Sharma
const reviewer = SSO_PERSONAS[1]; // Rajeshwari Iyer

test('Reviewer never sees own SOPs in For My Review queue', () => {
  const queue = getForMyReviewSops(SEED_SOPS, reviewer);
  assert.ok(queue.length >= 2);
  assert.equal(
    queue.some((s) => s.uploadedByEmail === reviewer.email),
    false
  );
  // Reviewer own submitted SOP (SOP-GRAP-007) appears in My SOPs instead
  const myReviewerSops = getMySops(SEED_SOPS, reviewer.email);
  assert.ok(myReviewerSops.some((s) => s.id === 'SOP-GRAP-007'));
});

test('Maker sees empty For My Review queue', () => {
  const queue = getForMyReviewSops(SEED_SOPS, maker);
  assert.equal(queue.length, 0);
});

test('Row action visibility matrix enforces strict status and tab rules', () => {
  const draftSop = SEED_SOPS.find((s) => s.status === 'Draft')!;
  const reqModSop = SEED_SOPS.find((s) => s.status === 'Requested Modification')!;
  const modInProgSop = SEED_SOPS.find((s) => s.status === 'Modification In Progress')!;
  const submittedOther = SEED_SOPS.find(
    (s) => s.status === 'Submitted' && s.uploadedByEmail !== reviewer.email
  )!;

  // Draft in My SOPs: View, Activity, Edit
  assert.deepEqual(getRowActionVisibility(draftSop, 'my-sops', maker), {
    canView: true,
    canActivity: true,
    canEdit: true,
    canMakeChanges: false,
    canReview: false,
  });

  // Requested Modification in My SOPs: View, Activity, Make changes
  assert.deepEqual(getRowActionVisibility(reqModSop, 'my-sops', maker), {
    canView: true,
    canActivity: true,
    canEdit: false,
    canMakeChanges: true,
    canReview: false,
  });

  // Modification In Progress in My SOPs: View, Activity, Edit
  assert.deepEqual(getRowActionVisibility(modInProgSop, 'my-sops', maker), {
    canView: true,
    canActivity: true,
    canEdit: true,
    canMakeChanges: false,
    canReview: false,
  });

  // Submitted by other in For My Review: View, Activity, Review
  assert.deepEqual(getRowActionVisibility(submittedOther, 'for-review', reviewer), {
    canView: true,
    canActivity: true,
    canEdit: false,
    canMakeChanges: false,
    canReview: true,
  });
});

test('File extension validation accepts only .doc, .docx, .pdf', () => {
  assert.equal(validateSopFileExtension('policy.pdf').ok, true);
  assert.equal(validateSopFileExtension('policy.DOCX').ok, true);
  assert.equal(validateSopFileExtension('policy.doc').ok, true);
  assert.equal(validateSopFileExtension('malware.exe').ok, false);
  assert.equal(validateSopFileExtension('notes.txt').ok, false);
});

test('Form validation rejects missing mandatory fields', () => {
  const errors = validateSopFormFields({
    file: null,
    name: '',
    category: '',
    subCategory: '',
  });
  assert.ok(errors.file);
  assert.ok(errors.name);
  assert.ok(errors.category);
  assert.ok(errors.subCategory);
});

test('Make changes -> Save & Submit increments version v1 -> v2 and transitions to Resubmitted', () => {
  const now1 = '2026-11-17T10:00:00.000Z';
  const afterMakeChanges = applyMakeChangesTransition(
    SEED_SOPS,
    'SOP-GRAP-003',
    maker,
    now1
  );
  const modSop = afterMakeChanges.find((s) => s.id === 'SOP-GRAP-003')!;
  assert.equal(modSop.status, 'Modification In Progress');
  assert.equal(modSop.version, 1);
  assert.equal(modSop.activities[0].action, 'Modification Started');

  // Saving while Modification In Progress keeps status & v1
  const now2 = '2026-11-17T10:05:00.000Z';
  const { nextSops: afterSave } = applySaveSop(
    afterMakeChanges,
    {
      name: modSop.name,
      category: modSop.category,
      subCategory: modSop.subCategory,
      comments: 'Updated draft notes',
      file: modSop.file,
      fileReplaced: false,
    },
    maker,
    now2,
    modSop.id
  );
  const savedModSop = afterSave.find((s) => s.id === 'SOP-GRAP-003')!;
  assert.equal(savedModSop.status, 'Modification In Progress');
  assert.equal(savedModSop.version, 1);

  // Save & Submit bumps v1 -> v2 and sets Resubmitted
  const now3 = '2026-11-17T10:10:00.000Z';
  const resubmitRes = applySaveAndSubmitSop(
    afterSave,
    {
      name: savedModSop.name,
      category: savedModSop.category,
      subCategory: savedModSop.subCategory,
      comments: 'Added RBI zero-liability reporting window table',
      file: savedModSop.file,
      fileReplaced: true,
    },
    maker,
    now3,
    savedModSop.id
  );
  const resubmittedSop = resubmitRes.nextSops.find(
    (s) => s.id === 'SOP-GRAP-003'
  )!;
  assert.equal(resubmittedSop.status, 'Resubmitted');
  assert.equal(resubmittedSop.version, 2);
  assert.equal(resubmittedSop.activities[0].action, 'Resubmitted');
  assert.equal(resubmittedSop.activities[0].versionBadge, 'v1 → v2');
});

test('Review decision enforces remarks for Request Modification & Reject and blocks self-review', () => {
  const emptyRemarksRes = applyReviewDecision(
    SEED_SOPS,
    'SOP-GRAP-002',
    'Requested Modification',
    '   ',
    reviewer,
    '2026-11-17T12:00:00.000Z'
  );
  assert.equal(emptyRemarksRes.ok, false);

  const selfReviewRes = applyReviewDecision(
    SEED_SOPS,
    'SOP-GRAP-007',
    'Approved',
    'Looks good',
    reviewer,
    '2026-11-17T12:00:00.000Z'
  );
  assert.equal(selfReviewRes.ok, false);

  const approveRes = applyReviewDecision(
    SEED_SOPS,
    'SOP-GRAP-002',
    'Approved',
    'Verified compliance',
    reviewer,
    '2026-11-17T12:00:00.000Z'
  );
  assert.equal(approveRes.ok, true);
  if (approveRes.ok) {
    const approved = approveRes.nextSops.find((s) => s.id === 'SOP-GRAP-002')!;
    assert.equal(approved.status, 'Approved');
    assert.equal(approved.activities[0].action, 'Approved');
  }
});

test('filterSops matches search by ID/Name, category, status, and date range', () => {
  const byId = filterSops(SEED_SOPS, {
    search: '006',
    category: '',
    subCategory: '',
    status: '',
    fromDate: '',
    toDate: '',
  });
  assert.equal(byId.length, 1);
  assert.equal(byId[0].id, 'SOP-GRAP-006');

  const byStatusAndCat = filterSops(SEED_SOPS, {
    search: '',
    category: 'Branch Operations',
    subCategory: '',
    status: 'Approved',
    fromDate: '',
    toDate: '',
  });
  assert.equal(byStatusAndCat.length, 1);
  assert.equal(byStatusAndCat[0].id, 'SOP-GRAP-001');
});

test('paginateItems slices items accurately and clamps out-of-range pages', () => {
  const page1 = paginateItems(SEED_SOPS, 1, 10);
  assert.equal(page1.items.length, 10);
  assert.equal(page1.totalItems, SEED_SOPS.length);
  assert.equal(page1.totalPages, Math.ceil(SEED_SOPS.length / 10));
  assert.equal(page1.startIndex, 1);
  assert.equal(page1.endIndex, 10);

  const page2 = paginateItems(SEED_SOPS, 2, 10);
  assert.equal(page2.items.length, SEED_SOPS.length - 10);
  assert.equal(page2.startIndex, 11);
  assert.equal(page2.endIndex, SEED_SOPS.length);

  const clamped = paginateItems(SEED_SOPS, 99, 10);
  assert.equal(clamped.currentPage, 2);
  assert.equal(clamped.items.length, SEED_SOPS.length - 10);

  const empty = paginateItems([], 2, 10);
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.currentPage, 1);
  assert.equal(empty.startIndex, 0);
  assert.equal(empty.endIndex, 0);
});
