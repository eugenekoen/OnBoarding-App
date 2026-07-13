import React from 'react';
import { OnboardingFormState } from '../types';
import { CheckCircle2, ShieldCheck, Mail, Calendar, Sparkles, Printer, FileText } from 'lucide-react';

interface SuccessViewProps {
  referenceNo: string;
  state: OnboardingFormState;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ referenceNo, state, onReset }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-scale-up">
      
      {/* Celebration Card */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden text-center relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand" />
        
        <div className="p-6 md:p-8 space-y-5">
          <div className="w-16 h-16 bg-accent-light border border-accent-border text-brand rounded-full flex items-center justify-center mx-auto shadow-inner relative">
            <CheckCircle2 className="w-8 h-8" />
            <span className="absolute -top-1 -right-2 bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Secured
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-accent-dark font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              Onboarding Completed Successfully
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-brand tracking-tight">
              Application Transmitted
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your comprehensive onboarding dossier has been verified and safely transmitted to our compliance &amp; registrations team at Holdstock &amp; Watson Inc.
            </p>
          </div>

          {/* Reference badge */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-md p-3 max-w-sm mx-auto flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Intake Reference Number</span>
            <span className="text-lg font-mono font-extrabold text-brand tracking-wider bg-white px-4 py-1.5 rounded-md border border-slate-200 shadow-xs select-all">
              {referenceNo}
            </span>
            <span className="text-[10px] text-slate-450 font-medium">Save or snapshot this code for reference in calls or letters</span>
          </div>

          {/* Guidelines / Next Steps */}
          <div className="text-left bg-slate-50/30 rounded-md border border-slate-200 p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-accent" />
              What happens next?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-full bg-accent-light border border-accent-border text-brand flex items-center justify-center shrink-0 font-extrabold text-[11px]">1</div>
                <div>
                  <h4 className="font-bold text-brand text-xs uppercase tracking-wide">Compliance Auditing</h4>
                  <p className="text-slate-650 mt-1 leading-relaxed text-xs">We will check your registered tax details (Income Tax, PAYE, VAT) against SARS databases for instant synchronization.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-full bg-accent-light border border-accent-border text-brand flex items-center justify-center shrink-0 font-extrabold text-[11px]">2</div>
                <div>
                  <h4 className="font-bold text-brand text-xs uppercase tracking-wide">Beneficial Ownership</h4>
                  <p className="text-slate-650 mt-1 leading-relaxed text-xs">Our registration managers will generate statutory CIPC forms if Beneficial Owner changes are required.</p>
                </div>
              </div>

              <div className="flex gap-2 items-start col-span-1 md:col-span-2 border-t border-slate-200/80 pt-3">
                <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-slate-700 leading-relaxed text-xs">
                  A verification email containing your completed form summary and a document upload link (for ID / Passport / Company Reg proof) has been sent to <strong className="text-brand">{state.clientInfo.emailAddress}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-5 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Complete Dossier</span>
            </button>

            <button
              onClick={onReset}
              className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Submit New Client Form</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
