import React from 'react';
import { ArrowRight, Lock, Shield, UserCheck, UserX } from 'lucide-react';
import { SSO_PERSONAS } from '../data/seedData';
import { UserProfile } from '../types/sop';
import { AxisLogo } from './AxisLogo';

interface SsoLoginScreenProps {
  onSelectPersona: (user: UserProfile) => void;
}

export const SsoLoginScreen: React.FC<SsoLoginScreenProps> = ({
  onSelectPersona,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">
      <div className="h-1.5 bg-gradient-to-r from-[#5E0B2E] via-[#97144D] to-[#ED1164]" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="bg-[#97144D] px-6 py-6 text-white">
            <div className="flex items-center gap-3.5">
              <AxisLogo variant="light" size="lg" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Axis Bank Corporate SSO
                </p>
                <h1 className="text-xl font-black tracking-tight text-white">
                  RetailOps – GRAP Portal
                </h1>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/85 leading-relaxed">
              Standard Operating Procedure (SOP) Governance &amp; Review System.
              Select an authenticated SSO persona below to sign in.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <Lock className="h-3.5 w-3.5 text-[#97144D]" />
              Select SSO Identity
            </div>

            {SSO_PERSONAS.map((persona) => {
              const Icon =
                persona.role === 'Reviewer'
                  ? Shield
                  : persona.role === 'Maker'
                  ? UserCheck
                  : UserX;

              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onSelectPersona(persona)}
                  className="w-full group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-[#97144D] hover:bg-[#F9EFF3]/50 transition-all"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F9EFF3] text-[#97144D] group-hover:bg-[#97144D] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {persona.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            persona.role === 'Reviewer'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : persona.role === 'Maker'
                              ? 'bg-[#F9EFF3] text-[#97144D] border-[#97144D]/25'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {persona.role === 'Unassigned'
                            ? 'Unassigned User'
                            : persona.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {persona.email}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {persona.designation} · {persona.employeeCode}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#97144D] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Axis Bank Identity Federation</span>
            <span>RetailOps – GRAP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
