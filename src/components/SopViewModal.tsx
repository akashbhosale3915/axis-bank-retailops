import React from 'react';
import { History, X } from 'lucide-react';
import { SOPRecord } from '../types/sop';
import { formatDateTime } from '../utils/storage';
import { DocumentPreview } from './DocumentPreview';
import { StatusBadge } from './StatusBadge';

interface SopViewModalProps {
  sop: SOPRecord | null;
  onClose: () => void;
  onOpenActivity: (sopId: string) => void;
}

export const SopViewModal: React.FC<SopViewModalProps> = ({
  sop,
  onClose,
  onOpenActivity,
}) => {
  if (!sop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px] p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#97144D] px-5 py-3.5 text-white">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold font-mono-tabular">
                {sop.id}
              </span>
              <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold tabular-nums">
                v{sop.version}
              </span>
              <StatusBadge status={sop.status} compact />
            </div>
            <h2
              id="view-modal-title"
              className="mt-1 truncate text-base sm:text-lg font-extrabold"
            >
              {sop.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenActivity(sop.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 whitespace-nowrap"
            >
              <History className="h-3.5 w-3.5" />
              View Activity
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
              aria-label="Close SOP preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#F5F6F8]">
          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 text-xs shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#97144D] border-b border-slate-100 pb-2">
                SOP Details (Read-Only)
              </h3>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Category / Sub-category
                </span>
                <span className="font-semibold text-slate-800">
                  {sop.category} &middot; {sop.subCategory}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Uploaded By
                </span>
                <span className="font-bold text-slate-800">
                  {sop.uploadedByName}
                </span>
                <span className="block text-slate-500">
                  {sop.uploadedByEmail}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    Created
                  </span>
                  <span className="text-slate-700 tabular-nums">
                    {formatDateTime(sop.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    Last Updated
                  </span>
                  <span className="text-slate-700 tabular-nums">
                    {formatDateTime(sop.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Creator Comments
                </span>
                <p className="rounded bg-slate-50 p-2.5 text-slate-700 border border-slate-200 leading-relaxed">
                  {sop.comments || 'No comments provided.'}
                </p>
              </div>

              {sop.latestReviewerRemarks && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-[#97144D] block mb-1">
                    Latest Reviewer Remarks
                  </span>
                  <p className="rounded bg-[#F9EFF3] p-2.5 text-slate-800 border border-[#97144D]/20 leading-relaxed">
                    {sop.latestReviewerRemarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Embedded Document Preview */}
          <div className="lg:col-span-8">
            <DocumentPreview
              sopId={sop.id}
              sopName={sop.name}
              version={sop.version}
              category={sop.category}
              subCategory={sop.subCategory}
              uploadedByName={sop.uploadedByName}
              file={sop.file}
              documentContent={sop.documentContent}
              heightClass="h-[360px] sm:h-[460px] lg:h-[540px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
