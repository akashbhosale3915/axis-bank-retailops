import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  History,
  MessageSquareWarning,
  XCircle,
} from 'lucide-react';
import { SOPRecord } from '../types/sop';
import { formatDateTime } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';
import { DocumentPreview } from './DocumentPreview';
import { StatusBadge } from './StatusBadge';

interface SopReviewScreenProps {
  sop: SOPRecord;
  onApprove: (remarks: string) => Promise<void>;
  onRequestModification: (remarks: string) => Promise<void>;
  onReject: (remarks: string) => Promise<void>;
  onOpenActivity: (sopId: string) => void;
  onBack: () => void;
}

export const SopReviewScreen: React.FC<SopReviewScreenProps> = ({
  sop,
  onApprove,
  onRequestModification,
  onReject,
  onOpenActivity,
  onBack,
}) => {
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRequestModification = async () => {
    if (!remarks.trim()) {
      setRemarksError(
        'Remarks are mandatory when requesting modification from the creator.'
      );
      return;
    }
    setRemarksError(null);
    setIsProcessing(true);
    try {
      await onRequestModification(remarks.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRejectModal = () => {
    if (!remarks.trim()) {
      setRemarksError('Remarks are mandatory when rejecting an SOP.');
      return;
    }
    setRemarksError(null);
    setModalAction('reject');
  };

  const handleConfirmModal = async () => {
    setIsProcessing(true);
    try {
      if (modalAction === 'approve') {
        await onApprove(remarks.trim());
      } else if (modalAction === 'reject') {
        await onReject(remarks.trim());
      }
    } finally {
      setIsProcessing(false);
      setModalAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="self-start inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 min-h-[40px] sm:min-h-0 sm:py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to For My Review
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#97144D] font-mono-tabular">
              {sop.id}
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Review SOP
            </h1>
            <StatusBadge status={sop.status} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenActivity(sop.id)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-md border border-[#97144D] bg-white px-3 py-2 min-h-[40px] sm:min-h-0 sm:py-1.5 text-xs font-bold text-[#97144D] hover:bg-[#F9EFF3] transition-colors whitespace-nowrap"
        >
          <History className="h-3.5 w-3.5" />
          View Activity ({sop.activities.length})
        </button>
      </div>

      {/* Split-Screen 60% / 40% Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
        {/* Left Pane (60% -> 6 of 10 cols): Full-height Embedded Document Preview */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <DocumentPreview
            sopId={sop.id}
            sopName={sop.name}
            version={sop.version}
            category={sop.category}
            subCategory={sop.subCategory}
            uploadedByName={sop.uploadedByName}
            file={sop.file}
            documentContent={sop.documentContent}
            heightClass="h-[420px] sm:h-[540px] lg:h-[680px]"
          />
        </div>

        {/* Right Pane (40% -> 4 of 10 cols): Structured Metadata & Decision Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-[#F9EFF3] px-5 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#97144D]">
                SOP Submission Details
              </p>
              <h2 className="mt-0.5 text-base font-extrabold text-slate-900 leading-snug">
                {sop.name}
              </h2>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    SOP ID
                  </span>
                  <span className="font-bold text-[#97144D] font-mono-tabular">
                    {sop.id}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Version
                  </span>
                  <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800 tabular-nums">
                    v{sop.version}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Category
                  </span>
                  <span className="font-semibold text-slate-800">
                    {sop.category}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Sub-category
                  </span>
                  <span className="font-semibold text-slate-800">
                    {sop.subCategory}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Uploaded by
                  </span>
                  <span className="font-bold text-slate-800">
                    {sop.uploadedByName}
                  </span>{' '}
                  <span className="text-slate-500">({sop.uploadedByEmail})</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-slate-400">
                      Created Date
                    </span>
                    <span className="text-slate-700 tabular-nums">
                      {formatDateTime(sop.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-slate-400">
                      Last Updated
                    </span>
                    <span className="text-slate-700 tabular-nums">
                      {formatDateTime(sop.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Creator&apos;s Comments
                </span>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 leading-relaxed">
                  {sop.comments ? (
                    sop.comments
                  ) : (
                    <span className="italic text-slate-400">
                      No comments entered by the creator.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Governance Decision Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div>
              <label
                htmlFor="reviewer-remarks"
                className="block text-xs font-bold text-slate-800 mb-1.5"
              >
                Remarks{' '}
                <span className="font-normal text-slate-500">
                  (Required for Request Modification &amp; Reject)
                </span>
              </label>
              <textarea
                id="reviewer-remarks"
                rows={4}
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (remarksError) setRemarksError(null);
                }}
                placeholder="Enter review feedback, compliance observations, or specific modification instructions..."
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  remarksError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-[#97144D] focus:ring-[#97144D]'
                }`}
              />
              {remarksError && (
                <p
                  role="alert"
                  className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {remarksError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setRemarksError(null);
                  setModalAction('approve');
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => void handleRequestModification()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-amber-500 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {isProcessing && !modalAction ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                ) : (
                  <MessageSquareWarning className="h-4 w-4" />
                )}
                Request Modification
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleOpenRejectModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals for Approve & Reject */}
      <ConfirmModal
        open={modalAction === 'approve'}
        title="Confirm SOP Approval"
        message="Are you sure you want to approve and publish this SOP to the GRAP knowledge base?"
        confirmLabel="Approve & Publish"
        variant="success"
        isLoading={isProcessing}
        onConfirm={() => void handleConfirmModal()}
        onCancel={() => setModalAction(null)}
      />

      <ConfirmModal
        open={modalAction === 'reject'}
        title="Confirm SOP Rejection"
        message="Are you sure you want to reject this SOP?"
        confirmLabel="Reject SOP"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={() => void handleConfirmModal()}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
};
