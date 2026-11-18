import React from 'react';
import { LockKeyhole, Mail, LogOut } from 'lucide-react';
import { UserProfile } from '../types/sop';

interface AccessDeniedScreenProps {
  currentUser: UserProfile;
  onSignOut: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  currentUser,
  onSignOut,
}) => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 bg-[#97144D]" />
        <div className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F9EFF3] text-[#97144D] border border-[#97144D]/20">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Access not assigned
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your Axis Bank SSO profile (<strong>{currentUser.email}</strong>)
            currently does not have a <strong>Maker</strong> or{' '}
            <strong>Reviewer</strong> role assigned for the{' '}
            <strong>RetailOps – GRAP SOP Management</strong> module.
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#97144D]" />
              How to request GRAP Portal access:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Raise an entitlement ticket on{' '}
                <strong>Axis ServiceDesk (ITSM)</strong> under{' '}
                <em>RetailOps – GRAP SOP Role Provisioning</em>.
              </li>
              <li>
                Provide your Employee Code (
                <strong>{currentUser.employeeCode}</strong>) and Reporting
                Manager approval for Maker or Reviewer access.
              </li>
              <li>
                For urgent escalation, contact{' '}
                <span className="font-semibold text-[#97144D]">
                  grap.accessadmin@axisbank.com
                </span>
                .
              </li>
            </ul>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-md bg-[#97144D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7A0F3D] transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Return to SSO Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
