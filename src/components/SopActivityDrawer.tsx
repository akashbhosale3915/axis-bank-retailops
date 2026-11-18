import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Clock,
  FileCheck2,
  History,
  MessageSquareText,
  User,
  X,
} from 'lucide-react';
import { SOPRecord } from '../types/sop';
import { formatDateTime } from '../utils/storage';
import { ActionBadge, StatusBadge } from './StatusBadge';

interface SopActivityDrawerProps {
  sop: SOPRecord | null;
  onClose: () => void;
}

export const SopActivityDrawer: React.FC<SopActivityDrawerProps> = ({
  sop,
  onClose,
}) => {
  useEffect(() => {
    if (!sop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sop, onClose]);

  const timeline = useMemo(() => {
    if (!sop) return [];
    return [...sop.activities].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [sop]);

  if (!sop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-drawer-title"
      onClick={onClose}
    >
      <aside
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Axis Bank Burgundy Top Accent Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-[#5E0B2E] via-[#ED1164] to-[#5E0B2E] shrink-0" />

        {/* Drawer Header */}
        <div className="bg-[#97144D] px-5 py-4 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/85">
                <History className="h-3.5 w-3.5" />
                <span>SOP Activity &amp; Audit Trail</span>
              </div>
              <h2
                id="activity-drawer-title"
                className="mt-1.5 text-base sm:text-lg font-extrabold text-white leading-snug"
              >
                {sop.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close activity sidebar"
              className="rounded-md p-1.5 text-white/85 hover:bg-white/15 hover:text-white transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold font-mono-tabular">
              {sop.id}
            </span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold tabular-nums">
              Current Version: v{sop.version}
            </span>
            <StatusBadge status={sop.status} compact />
          </div>
        </div>

        {/* Summary Strip */}
        <div className="border-b border-slate-200 bg-[#F9EFF3]/70 px-5 py-3 text-xs text-slate-600 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate">
              <span className="font-semibold text-slate-800">{sop.category}</span>{' '}
              &middot; {sop.subCategory}
            </p>
            <span className="font-bold text-[#97144D] tabular-nums whitespace-nowrap">
              {timeline.length} {timeline.length === 1 ? 'Event' : 'Events'} · Newest First
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Owner: <strong className="text-slate-700">{sop.uploadedByName}</strong> (
            {sop.uploadedByEmail}) · Last Updated: {formatDateTime(sop.updatedAt)}
          </p>
        </div>

        {/* Scrollable Newest-First Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-5 bg-[#F5F6F8]">
          <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
            {timeline.map((item, idx) => (
              <div key={item.id} className="relative">
                <span
                  className={`absolute -left-6 top-3 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#F5F6F8] ${
                    idx === 0 ? 'bg-[#97144D]' : 'bg-slate-400'
                  }`}
                />

                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs hover:border-[#97144D]/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ActionBadge action={item.action} />
                      {item.versionBadge && (
                        <span className="inline-flex items-center gap-1 rounded border border-[#97144D]/25 bg-[#F9EFF3] px-2 py-0.5 text-[11px] font-bold text-[#97144D] tabular-nums">
                          <FileCheck2 className="h-3 w-3" />
                          {item.versionBadge}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 tabular-nums">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {formatDateTime(item.timestamp)}
                    </div>
                  </div>

                  {/* Actor & Status Transition */}
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong className="text-slate-900">{item.doneByName}</strong>{' '}
                        <span className="text-slate-500">({item.doneByEmail})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.statusBefore ? (
                        <>
                          <StatusBadge status={item.statusBefore} compact />
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <StatusBadge status={item.statusAfter} compact />
                        </>
                      ) : (
                        <StatusBadge status={item.statusAfter} compact />
                      )}
                    </div>
                  </div>

                  {item.remarks && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-md border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs text-slate-700 leading-relaxed">
                      <MessageSquareText className="h-3.5 w-3.5 text-[#97144D] shrink-0 mt-0.5" />
                      <p>{item.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Axis Bank RetailOps · GRAP Audit Log
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#97144D] bg-white px-4 py-1.5 text-xs font-bold text-[#97144D] hover:bg-[#F9EFF3] transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
