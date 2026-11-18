import React, { useEffect, useRef, useState } from 'react';
import {
  ClipboardCheck,
  Eye,
  History,
  MoreVertical,
  Pencil,
  Wrench,
} from 'lucide-react';
import { SOPRecord } from '../types/sop';
import { RowActionVisibility } from '../utils/sopRules';

interface RowActionsMenuProps {
  sop: SOPRecord;
  visibility: RowActionVisibility;
  onViewSop: (sop: SOPRecord) => void;
  onOpenActivity: (sopId: string) => void;
  onEditSop: (sopId: string) => void;
  onMakeChanges: (sopId: string) => void;
  onReviewSop: (sopId: string) => void;
  compact?: boolean;
}

interface MenuCoords {
  top?: number;
  bottom?: number;
  right: number;
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({
  sop,
  visibility,
  onViewSop,
  onOpenActivity,
  onEditSop,
  onMakeChanges,
  onReviewSop,
  compact = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = 112;
    const rightOffset = Math.max(8, window.innerWidth - rect.right);

    if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        right: rightOffset,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        right: rightOffset,
      });
    }
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleWindowScroll = (e: Event) => {
      if (e.target === document || e.target === document.documentElement) {
        setMenuOpen(false);
      }
    };
    const handleResize = () => setMenuOpen(false);

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleWindowScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  // Pick single primary action button for the row
  const primaryAction = visibility.canReview
    ? {
        key: 'review',
        label: 'Review',
        ariaLabel: `Review ${sop.id}`,
        Icon: ClipboardCheck,
        onClick: () => onReviewSop(sop.id),
        className:
          'bg-[#97144D] text-white border-[#97144D] hover:bg-[#7A0F3D] shadow-xs',
      }
    : visibility.canMakeChanges
    ? {
        key: 'make-changes',
        label: 'Make changes',
        ariaLabel: `Make changes to ${sop.id}`,
        Icon: Wrench,
        onClick: () => onMakeChanges(sop.id),
        className:
          'bg-amber-600 text-white border-amber-600 hover:bg-amber-700 shadow-xs',
      }
    : visibility.canEdit
    ? {
        key: 'edit',
        label: 'Edit',
        ariaLabel: `Edit ${sop.id}`,
        Icon: Pencil,
        onClick: () => onEditSop(sop.id),
        className:
          'bg-white text-[#97144D] border-[#97144D] hover:bg-[#F9EFF3]',
      }
    : {
        key: 'view',
        label: 'View',
        ariaLabel: `View ${sop.id}`,
        Icon: Eye,
        onClick: () => onViewSop(sop),
        className:
          'bg-white text-slate-700 border-slate-300 hover:border-[#97144D] hover:text-[#97144D]',
      };

  const PrimaryIcon = primaryAction.Icon;

  return (
    <div
      className={
        compact
          ? 'inline-flex items-center justify-end gap-1'
          : 'flex items-center gap-2'
      }
    >
      <button
        type="button"
        onClick={primaryAction.onClick}
        aria-label={primaryAction.ariaLabel}
        className={`inline-flex items-center justify-center gap-1 rounded border font-bold transition-colors whitespace-nowrap ${
          compact
            ? 'px-2 py-1 text-[11px] max-w-[116px]'
            : 'flex-1 min-h-[40px] px-3 py-2 text-xs'
        } ${primaryAction.className}`}
      >
        <PrimaryIcon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
        <span className="truncate">{primaryAction.label}</span>
      </button>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`More actions for ${sop.id}`}
        title="More actions (View, Activity)"
        className={`inline-flex items-center justify-center rounded border transition-colors shrink-0 ${
          menuOpen
            ? 'border-[#97144D] bg-[#F9EFF3] text-[#97144D]'
            : 'border-slate-200 bg-white text-slate-600 hover:border-[#97144D] hover:text-[#97144D]'
        } ${compact ? 'h-[26px] w-[26px]' : 'h-[40px] w-[40px]'}`}
      >
        <MoreVertical className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>

      {menuOpen && coords && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${sop.id}`}
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            right: coords.right,
          }}
          className="z-50 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
        >
          {visibility.canView && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onViewSop(sop);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#F9EFF3] hover:text-[#97144D] transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span>View Details</span>
            </button>
          )}

          {visibility.canActivity && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onOpenActivity(sop.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#F9EFF3] hover:text-[#97144D] transition-colors"
            >
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span>Activity Trail</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
