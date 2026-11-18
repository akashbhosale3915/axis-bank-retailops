import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  MessageSquareWarning,
  Save,
  Send,
  UploadCloud,
} from 'lucide-react';
import { CATEGORY_SUBCATEGORY_MAP } from '../data/seedData';
import { SOPFileAttachment, SOPRecord } from '../types/sop';
import { FormValidationErrors, validateSopFormFields } from '../utils/sopRules';
import { formatFileSize, validateAndReadSopFile } from '../utils/storage';
import { DocumentPreview } from './DocumentPreview';
import { StatusBadge } from './StatusBadge';

interface SopFormScreenProps {
  mode: 'add' | 'edit';
  existingSop?: SOPRecord;
  onSaveDraftOrInProgress: (payload: {
    name: string;
    category: string;
    subCategory: string;
    comments: string;
    file: SOPFileAttachment;
    fileReplaced: boolean;
  }) => Promise<void>;
  onSaveAndSubmit: (payload: {
    name: string;
    category: string;
    subCategory: string;
    comments: string;
    file: SOPFileAttachment;
    fileReplaced: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export const SopFormScreen: React.FC<SopFormScreenProps> = ({
  mode,
  existingSop,
  onSaveDraftOrInProgress,
  onSaveAndSubmit,
  onCancel,
}) => {
  const isModification =
    mode === 'edit' && existingSop?.status === 'Modification In Progress';

  const [name, setName] = useState(existingSop?.name ?? '');
  const [category, setCategory] = useState(existingSop?.category ?? '');
  const [customCategoryMode, setCustomCategoryMode] = useState(() => {
    if (!existingSop?.category) return false;
    return !Object.keys(CATEGORY_SUBCATEGORY_MAP).includes(existingSop.category);
  });
  const [subCategory, setSubCategory] = useState(existingSop?.subCategory ?? '');
  const [comments, setComments] = useState(existingSop?.comments ?? '');
  const [file, setFile] = useState<SOPFileAttachment | null>(
    existingSop?.file ?? null
  );
  const [fileReplaced, setFileReplaced] = useState(false);

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<
    'save' | 'submit' | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedSubCategories = useMemo(() => {
    return CATEGORY_SUBCATEGORY_MAP[category] ?? [];
  }, [category]);

  const currentVersion = existingSop?.version ?? 1;
  const displayVersionText = isModification
    ? `v${currentVersion} → v${currentVersion + 1} (auto-increments on Resubmit)`
    : `v${currentVersion}`;

  const handleFileSelection = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    const result = await validateAndReadSopFile(selectedFile);
    if (!result.ok) {
      setErrors((prev) => ({ ...prev, file: result.error }));
      return;
    }
    setFile(result.attachment);
    setFileReplaced(true);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validateAll = (): boolean => {
    const nextErrors = validateSopFormFields({
      file,
      name,
      category,
      subCategory,
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAction = async (action: 'save' | 'submit') => {
    if (!validateAll() || !file) return;
    setSubmittingAction(action);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        subCategory: subCategory.trim(),
        comments: comments.trim(),
        file,
        fileReplaced,
      };
      if (action === 'save') {
        await onSaveDraftOrInProgress(payload);
      } else {
        await onSaveAndSubmit(payload);
      }
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="self-start inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 min-h-[40px] sm:min-h-0 sm:py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to SOP Listing
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900">
                {mode === 'add' ? 'Add New SOP' : `Edit SOP · ${existingSop?.id}`}
              </h1>
              {existingSop && <StatusBadge status={existingSop.status} />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload SOP documentation (.doc, .docx, .pdf) and configure GRAP metadata
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Remarks Banner when Modification In Progress */}
      {isModification && existingSop?.latestReviewerRemarks && (
        <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-[#F9EFF3] p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-extrabold text-amber-950">
                  Reviewer Modification Remarks
                </h2>
                {existingSop.latestReviewedBy && (
                  <span className="text-xs font-semibold text-[#97144D]">
                    · Requested by {existingSop.latestReviewedBy}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                {existingSop.latestReviewerRemarks}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Form & Live Preview Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Form Column (5 cols) */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              SOP Metadata &amp; File Upload
            </h2>
          </div>

          <div className="p-5 space-y-5">
            {/* 1. SOP File Upload (Mandatory) */}
            <div>
              <label
                htmlFor="sop-file-input"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                SOP file <span className="text-red-600">*</span>
                <span className="ml-1.5 font-normal text-slate-400">
                  (.doc, .docx, .pdf only)
                </span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  void handleFileSelection(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-lg border-2 border-dashed transition-colors ${
                  errors.file
                    ? 'border-red-400 bg-red-50/40'
                    : isDragging
                    ? 'border-[#97144D] bg-[#F9EFF3]'
                    : file
                    ? 'border-emerald-300 bg-emerald-50/30 hover:border-[#97144D]'
                    : 'border-slate-300 bg-slate-50/70 hover:border-[#97144D] hover:bg-[#F9EFF3]/40'
                }`}
              >
                <input
                  id="sop-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(e) => {
                    void handleFileSelection(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-5 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#97144D] rounded-lg"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-[#97144D]">
                    {file ? (
                      <FileUp className="h-5 w-5" />
                    ) : (
                      <UploadCloud className="h-5 w-5" />
                    )}
                  </div>

                  {file ? (
                    <div className="mt-2.5">
                      <p className="text-xs font-bold text-slate-900 break-all">
                        {file.fileName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                        {formatFileSize(file.fileSize)} · Click or drag a file to replace
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        {fileReplaced ? 'New file attached' : 'Current SOP file loaded'}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2.5">
                      <p className="text-xs font-bold text-slate-800">
                        Drag &amp; drop SOP file here, or{' '}
                        <span className="text-[#97144D] underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Accepted formats: .doc, .docx, .pdf (Max 3.5 MB)
                      </p>
                    </div>
                  )}
                </button>
              </div>

              {errors.file && (
                <p
                  role="alert"
                  className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* 2. SOP Name (Mandatory) */}
            <div>
              <label
                htmlFor="sop-name"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                SOP name <span className="text-red-600">*</span>
              </label>
              <input
                id="sop-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g., Retail Fixed Deposit Premature Closure SOP"
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-[#97144D] focus:ring-[#97144D]'
                }`}
              />
              {errors.name && (
                <p
                  role="alert"
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 3. Version (Read-only System Field) */}
            <div>
              <label
                htmlFor="sop-version"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Version{' '}
                <span className="ml-1 font-normal text-slate-400">
                  (System-assigned read-only)
                </span>
              </label>
              <input
                id="sop-version"
                type="text"
                readOnly
                value={displayVersionText}
                className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 tabular-nums cursor-not-allowed"
              />
            </div>

            {/* 4. Category (Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="sop-category"
                  className="block text-xs font-bold text-slate-700"
                >
                  Category <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategoryMode((prev) => !prev);
                    setCategory('');
                    setSubCategory('');
                  }}
                  className="text-[11px] font-bold text-[#97144D] hover:underline"
                >
                  {customCategoryMode
                    ? 'Select from standard list'
                    : '+ Enter custom category'}
                </button>
              </div>

              {customCategoryMode ? (
                <input
                  id="sop-category"
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category)
                      setErrors((p) => ({ ...p, category: undefined }));
                  }}
                  placeholder="Enter custom RetailOps category"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors.category
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-[#97144D] focus:ring-[#97144D]'
                  }`}
                />
              ) : (
                <select
                  id="sop-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory('');
                    if (errors.category)
                      setErrors((p) => ({ ...p, category: undefined }));
                  }}
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors.category
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-[#97144D] focus:ring-[#97144D]'
                  }`}
                >
                  <option value="">Select Category...</option>
                  {Object.keys(CATEGORY_SUBCATEGORY_MAP).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {errors.category && (
                <p
                  role="alert"
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* 5. Sub-category (Mandatory) */}
            <div>
              <label
                htmlFor="sop-subcategory"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Sub-category <span className="text-red-600">*</span>
              </label>

              <input
                id="sop-subcategory"
                type="text"
                list="axis-subcategory-suggestions"
                value={subCategory}
                onChange={(e) => {
                  setSubCategory(e.target.value);
                  if (errors.subCategory)
                    setErrors((p) => ({ ...p, subCategory: undefined }));
                }}
                placeholder={
                  suggestedSubCategories.length > 0
                    ? 'Select or type sub-category...'
                    : 'Enter sub-category...'
                }
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                  errors.subCategory
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-[#97144D] focus:ring-[#97144D]'
                }`}
              />
              <datalist id="axis-subcategory-suggestions">
                {suggestedSubCategories.map((sc) => (
                  <option key={sc} value={sc} />
                ))}
              </datalist>

              {suggestedSubCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {suggestedSubCategories.map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => {
                        setSubCategory(sc);
                        setErrors((p) => ({ ...p, subCategory: undefined }));
                      }}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                        subCategory === sc
                          ? 'bg-[#97144D] text-white border-[#97144D]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#97144D] hover:text-[#97144D]'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              )}

              {errors.subCategory && (
                <p
                  role="alert"
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.subCategory}
                </p>
              )}
            </div>

            {/* 6. Comments (Optional) */}
            <div>
              <label
                htmlFor="sop-comments"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Comments{' '}
                <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="sop-comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add summary of changes, regulatory circular references, or notes for the Reviewer..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
              />
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submittingAction !== null}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleAction('save')}
              disabled={submittingAction !== null}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#97144D] bg-white px-4 py-2 text-sm font-bold text-[#97144D] hover:bg-[#F9EFF3] disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {submittingAction === 'save' ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#97144D] border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isModification ? 'Save Progress' : 'Save Draft'}
            </button>

            <button
              type="button"
              onClick={() => void handleAction('submit')}
              disabled={submittingAction !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#97144D] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#7A0F3D] disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {submittingAction === 'submit' ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Save &amp; Submit
            </button>
          </div>
        </div>

        {/* Right Live Embedded Document Preview Column (7 cols) */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5 flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Live Embedded Document Preview
            </h2>
            <span className="text-xs text-slate-500 truncate">
              {file ? file.fileName : 'Awaiting document upload'}
            </span>
          </div>

          <div className="p-4 flex-1">
            {file ? (
              <DocumentPreview
                sopId={existingSop?.id ?? 'NEW-SOP'}
                sopName={name || 'Untitled Standard Operating Procedure'}
                version={currentVersion}
                category={category || 'Retail Operations'}
                subCategory={subCategory || 'General'}
                uploadedByName={existingSop?.uploadedByName}
                file={file}
                documentContent={
                  fileReplaced ? undefined : existingSop?.documentContent
                }
                heightClass="h-[420px] sm:h-[520px] xl:h-[620px]"
              />
            ) : (
              <div className="h-[340px] sm:h-[500px] xl:h-[620px] flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-6 sm:p-8 text-center">
                <UploadCloud className="h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  No SOP file attached yet
                </p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Upload a <strong>.pdf</strong>, <strong>.doc</strong>, or{' '}
                  <strong>.docx</strong> file on the left to inspect its live embedded
                  preview before saving or submitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
