import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  AlertTriangle,
  Wrench,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { SOPActionType, SOPStatus } from '../types/sop';

const STATUS_STYLES: Record<
  SOPStatus,
  { bg: string; text: string; border: string; Icon: React.ElementType }
> = {
  Draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    Icon: FileEdit,
  },
  Submitted: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    Icon: Clock,
  },
  'Requested Modification': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    Icon: AlertTriangle,
  },
  'Modification In Progress': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    Icon: Wrench,
  },
  Resubmitted: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    Icon: RefreshCw,
  },
  Approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    Icon: CheckCircle2,
  },
  Rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    Icon: XCircle,
  },
};

export const StatusBadge: React.FC<{
  status: SOPStatus;
  compact?: boolean;
}> = ({ status, compact = false }) => {
  const { bg, text, border, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap shrink-0 ${bg} ${text} ${border} ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      {status}
    </span>
  );
};

const ACTION_STYLES: Record<SOPActionType, string> = {
  Created: 'bg-slate-100 text-slate-700 border-slate-300',
  Saved: 'bg-slate-100 text-slate-700 border-slate-300',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  'Modification Requested': 'bg-amber-50 text-amber-800 border-amber-300',
  'Modification Started': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Resubmitted: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

export const ActionBadge: React.FC<{ action: SOPActionType }> = ({ action }) => {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wide whitespace-nowrap shrink-0 ${ACTION_STYLES[action]}`}
    >
      {action}
    </span>
  );
};
