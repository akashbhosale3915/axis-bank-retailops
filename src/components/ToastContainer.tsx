import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { ToastMessage } from '../types/sop';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-16 left-3 right-3 sm:left-auto sm:top-20 sm:right-5 z-50 flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-300 bg-white'
            : toast.type === 'error'
            ? 'border-red-300 bg-white'
            : toast.type === 'warning'
            ? 'border-amber-300 bg-white'
            : 'border-[#97144D]/35 bg-white';

        const iconBgClass =
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-600'
            : toast.type === 'error'
            ? 'bg-red-50 text-red-600'
            : toast.type === 'warning'
            ? 'bg-amber-50 text-amber-600'
            : 'bg-[#F9EFF3] text-[#97144D]';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : toast.type === 'warning'
            ? AlertTriangle
            : Info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg transition-all ${borderClass}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconBgClass}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#97144D]"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
