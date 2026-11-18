import React, { useState } from 'react';
import {
  LogOut,
  Menu,
  RotateCcw,
  Shield,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { UserProfile } from '../types/sop';
import { AxisLogo } from './AxisLogo';

interface HeaderProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  onResetDemo: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSignOut,
  onResetDemo,
  onGoHome,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const badgeStyle =
    currentUser.role === 'Reviewer'
      ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40'
      : currentUser.role === 'Maker'
      ? 'bg-white/15 text-white border-white/30'
      : 'bg-amber-400/25 text-amber-100 border-amber-300/40';

  const roleLabel =
    currentUser.role === 'Unassigned' ? 'Unassigned User' : currentUser.role;

  return (
    <header className="sticky top-0 z-30 bg-[#97144D] text-white shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-[#5E0B2E] via-[#ED1164] to-[#5E0B2E]" />

      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
        {/* Left Brand Lockup */}
        <button
          type="button"
          onClick={() => {
            setMobileDrawerOpen(false);
            onGoHome();
          }}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none min-w-0 shrink"
        >
          <AxisLogo variant="light" size="sm" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-sm sm:text-lg font-black tracking-wide text-white whitespace-nowrap">
              AXIS BANK
            </span>
            <span
              className="text-white/40 font-light hidden sm:inline"
              aria-hidden="true"
            >
              |
            </span>
            <span className="text-xs sm:text-base font-bold text-[#F9EFF3] group-hover:underline truncate">
              RetailOps – GRAP
            </span>
          </div>
        </button>

        {/* Desktop Right Controls (md and above) */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onResetDemo}
            title="Restore seeded demo SOPs in localStorage"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-[#7A0F3D]/80 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#5E0B2E] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* Logged-in User Info & Role Badge */}
          <div className="flex items-center gap-2.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 whitespace-nowrap shrink-0">
            <span className="text-xs font-bold text-white">
              {currentUser.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgeStyle}`}
            >
              {currentUser.role === 'Reviewer' ? (
                <Shield className="h-3 w-3" />
              ) : currentUser.role === 'Maker' ? (
                <UserCheck className="h-3 w-3" />
              ) : (
                <UserX className="h-3 w-3" />
              )}
              {roleLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-[#5E0B2E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#490823] transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile Right Controls (< md): Compact Role Badge + Hamburger Menu */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${badgeStyle}`}
          >
            {currentUser.role === 'Reviewer' ? (
              <Shield className="h-3 w-3 shrink-0" />
            ) : currentUser.role === 'Maker' ? (
              <UserCheck className="h-3 w-3 shrink-0" />
            ) : (
              <UserX className="h-3 w-3 shrink-0" />
            )}
            <span>
              {currentUser.role === 'Unassigned'
                ? 'Unassigned'
                : currentUser.role}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-expanded={mobileDrawerOpen}
            aria-label={
              mobileDrawerOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {mobileDrawerOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Axis Bank Mobile Slide-Down Drawer (< md) */}
      {mobileDrawerOpen && (
        <div className="md:hidden border-t border-white/15 bg-white text-slate-800 shadow-xl">
          <div className="px-4 py-3.5 bg-[#F9EFF3] border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {currentUser.email}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {currentUser.designation}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#97144D] px-2.5 py-1 text-[11px] font-bold text-white">
              {roleLabel}
            </span>
          </div>

          <div className="px-4 py-3 grid grid-cols-2 gap-2.5 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onResetDemo();
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#97144D] bg-white px-3 py-2.5 text-xs font-bold text-[#97144D] hover:bg-[#F9EFF3] min-h-[44px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onSignOut();
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#97144D] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#7A0F3D] min-h-[44px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
