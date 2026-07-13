import React, { useRef, useState } from 'react';
import { OnboardingFormState } from '../types';
import { ArrowLeft, Check, Download, Landmark, Printer, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface SummaryPreviewProps {
  state: OnboardingFormState;
  onBack: () => void;
  onSubmitComplete: (referenceNo: string) => void;
}

export const SummaryPreview: React.FC<SummaryPreviewProps> = ({ state, onBack, onSubmitComplete }) => {
  const [signatureName, setSignatureName] = useState(state.clientInfo.contactName || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) {
      setErrorMsg('Please enter your full name in the authorized sign-off box.');
      return;
    }
    if (!agreedToPrivacy) {
      setErrorMsg('Please review and tick the Privacy Policy & Data Processing consent checkbox.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Simulate elite submission sequence with realistic intervals
    setTimeout(() => {
      const generatedRef = `HW-INT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsSubmitting(false);
      onSubmitComplete(generatedRef);
    }, 2800);
  };

  const getServiceList = () => {
    const servicesMap = [
      { key: 'annualTaxReturns', label: 'Annual Tax Returns' },
      { key: 'irp6Returns', label: 'IRP6 (Prov) Returns' },
      { key: 'vat201Returns', label: 'VAT 201 Returns' },
      { key: 'cipcAnnualReturns', label: 'CIPC Annual Returns' },
      { key: 'emp201Returns', label: 'EMP 201 Returns' },
      { key: 'emp501Returns', label: 'EMP 501 Reconciliations' },
      { key: 'payrollService', label: 'Payroll Service' },
      { key: 'workmensCompReg', label: 'Workmen’s Comp Reg' },
      { key: 'annualFinancialStatements', label: 'Annual Financial Statements' },
      { key: 'annualAudit', label: 'Annual Audit' },
      { key: 'managementAccounts', label: 'Management Accounts' },
      { key: 'monthlyBooks', label: 'Monthly Books' },
    ] as const;

    return servicesMap.filter(s => !!state.services[s.key]);
  };

  const selectedServices = getServiceList();  return (
    <div className="space-y-4 animate-fade-in print:bg-white print:p-0 print:m-0">
      
      {/* Alert banner */}
      <div className="bg-slate-50 border border-slate-200 border-l-4 border-slate-800 p-3 rounded-r-md print:hidden">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
          <div className="flex gap-2.5">
            <UserCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Review &amp; Sign Off</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Verify that all information is complete. You can download or print this document at any stage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs self-end md:self-auto transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* Corporate Document Mock Paper sheet layout */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-md overflow-hidden p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header - Authentic SA letterhead design */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-4 gap-6">
          <div>
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-extrabold text-slate-950 tracking-tighter">H</span>
              <span className="text-4xl font-extrabold text-slate-600 tracking-tighter -ml-1">W</span>
            </div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Holdstock &amp; Watson Inc
            </h1>
            <p className="text-[10px] text-slate-800 font-bold tracking-wide uppercase">
              Chartered Accountants (SA) &amp; Registered Auditors
            </p>
            <p className="text-[9px] text-slate-500 font-medium">
              Incorporating KH Financial Services • Practice Number: 954195
            </p>
          </div>

          <div className="text-right text-[9px] text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-900">11 Holden Avenue, Windermere</p>
            <p>Access from Montpelier Road, Durban</p>
            <p className="font-bold text-slate-900">P.O. Box 5107, Durban, 4000</p>
            <p>TEL | (031) 324 1900</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5 max-w-xs mx-auto">
            Client Intake &amp; Onboarding Profile
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">Generated: {new Date().toLocaleDateString('en-ZA')}</p>
        </div>

        {/* Section 1: Entity & Contact Profile */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-l-2 border-slate-800 pl-1.5">
            1. Entity Structure &amp; Contacts
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-[11px] bg-slate-50/40 p-3 rounded-md border border-slate-150/80">
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Entity Type:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.entityType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Registered Entity Name:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.entityName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Registration Number:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.entityRegistrationNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Primary Contact Name:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.contactName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Cellphone Number:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.cellphoneNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Email Address:</span>
              <span className="font-bold text-slate-900 break-all">{state.clientInfo.emailAddress || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Landline Number:</span>
              <span className="font-medium text-slate-900">{state.clientInfo.telephoneNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Financial Year End:</span>
              <span className="font-bold text-slate-900">{state.clientInfo.financialYearEnd || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Referred By:</span>
              <span className="font-medium text-slate-900">{state.clientInfo.referredBy || '—'}</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Registered Address:</span>
              <span className="font-medium text-slate-900 whitespace-pre-wrap">{state.clientInfo.registeredAddress || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Postal Address:</span>
              <span className="font-medium text-slate-900 whitespace-pre-wrap">
                {state.clientInfo.sameAsRegistered ? 'Same as Physical Address' : state.clientInfo.postalAddress || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Tax References */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-l-2 border-slate-800 pl-1.5">
            2. Statutory Tax Registrations
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-[11px] bg-slate-50/40 p-3 rounded-md border border-slate-150/80">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">Income Tax:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{state.clientInfo.incomeTaxNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">VAT Number:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{state.clientInfo.vatNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">PAYE Number:</span>
              <span className="font-bold text-slate-950 font-mono text-xs">{state.clientInfo.payeNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">UIF Number:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{state.clientInfo.uifNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">SDL Number:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{state.clientInfo.sdlNumber || 'Not Registered'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Services Requested */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-l-2 border-slate-800 pl-1.5">
            3. Selected Financial Services
          </h3>
          
          {selectedServices.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-md">No services selected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedServices.map(s => (
                <div key={s.key} className="flex items-center gap-1.5 bg-slate-50/40 border border-slate-200/80 p-2 rounded-md text-[11px] text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[4]" />
                  </span>
                  <span className="font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-900 text-white p-2.5 rounded-md text-xs flex justify-between items-center">
            <span className="uppercase font-bold tracking-wider text-[10px]">Monthly Retainer Request:</span>
            <span className="text-slate-950 bg-white px-2 py-0.5 rounded font-extrabold tracking-wider text-[10px]">
              {state.services.monthlyRetainer}
            </span>
          </div>
        </div>

        {/* Section 4: Beneficial Owners Register */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-l-2 border-slate-800 pl-1.5">
            4. Beneficial Ownership Register
          </h3>
          
          {state.beneficialOwners.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-800 flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500" />
              <p className="font-semibold">
                No Beneficial Owners have been declared on this form. Note that for private companies, declaring ultimate beneficiaries is required for compliance with modern South African laws.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-md overflow-hidden text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px]">
                    <th className="p-2 font-bold uppercase tracking-wider">Owner / Representative</th>
                    <th className="p-2 font-bold uppercase tracking-wider">Type / Citizenship</th>
                    <th className="p-2 font-bold uppercase tracking-wider">Identification / Reg</th>
                    <th className="p-2 font-bold uppercase tracking-wider">Contact Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.beneficialOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-2">
                        <span className="font-bold text-slate-900">
                          {owner.type === 'Company' ? owner.companyName : owner.fullName}
                        </span>
                        {owner.type === 'Company' && (
                          <span className="block text-[10px] text-slate-500">Rep: {owner.contactName}</span>
                        )}
                      </td>
                      <td className="p-2 uppercase font-semibold text-[9px]">
                        {owner.type === 'Individual' && <span className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">SA Citizen</span>}
                        {owner.type === 'NonResident' && <span className="text-blue-700 bg-blue-50/50 px-1 py-0.5 rounded">Foreign National</span>}
                        {owner.type === 'Company' && <span className="text-purple-700 bg-purple-50/50 px-1 py-0.5 rounded">Corporate Shareholder</span>}
                      </td>
                      <td className="p-2 font-mono text-[10px] text-slate-800">
                        {owner.type === 'Individual' && `ID: ${owner.idNumber}`}
                        {owner.type === 'NonResident' && (
                          <div className="space-y-0.5">
                            <span>Passport: {owner.passportNumber} ({owner.passportCountryOfOrigin})</span>
                            <span className="block text-[10px] text-slate-500 font-sans">Tax Ref: {owner.taxReferenceNumber}</span>
                            {owner.taxReferenceNumber === 'N/A' && (
                              <span className="block text-[9px] text-slate-400 font-sans italic">Reason: {owner.noTaxReason}</span>
                            )}
                          </div>
                        )}
                        {owner.type === 'Company' && `Reg: ${owner.registrationNumber}`}
                      </td>
                      <td className="p-2 text-slate-600 text-[10px]">
                        <p>{owner.email}</p>
                        <p>{owner.cell}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy & Compliance Notice */}
        <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-md space-y-1.5 text-[11px]">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide">Privacy Statement &amp; POPIA Compliance</h4>
          <p className="text-slate-600 leading-relaxed">
            By completing this form and submitting it, you choose to agree to our Privacy Policy Statement regarding the way we collect and process your personal information. Should you like a copy of our Privacy Policy Statement, please let us know.
          </p>
          <p className="text-slate-400 italic text-[10px] leading-relaxed">
            Please note that it is the client’s responsibility to ensure that all requested services are selected to ensure full transparency between us and the client. Should you require any services added or removed, please contact us and we shall do so.
          </p>
        </div>

        {/* Signature Line Area */}
        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-2">Authorized Onboarding Signature</h4>
            
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                I warrant that I am duly authorized to complete this client onboarding application and select compliance services for this entity.
              </p>
              
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="rounded border-slate-350 text-slate-900 focus:ring-slate-500 h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="consent" className="text-[11px] font-bold text-slate-900 cursor-pointer select-none">
                  I agree to the privacy statement and confirm all selections. <span className="text-slate-600">*</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Representative Full Name <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => {
                  setSignatureName(e.target.value);
                  setTypedSignature(e.target.value);
                }}
                placeholder="Type your full name to sign"
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 p-2 outline-none font-bold placeholder:font-normal"
              />
            </div>

            {typedSignature && (
              <div className="bg-slate-50 p-3 rounded-md border border-dashed border-slate-200 text-center select-none animate-fade-in">
                <span className="text-slate-400 text-[9px] uppercase font-semibold block mb-0.5">Generated Electronic Stamp</span>
                <span className="font-serif italic text-2xl text-slate-800 tracking-wide block">
                  {typedSignature}
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Date signed: {new Date().toLocaleDateString('en-ZA')} • Secured Onboarding Stamp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info matching physical document */}
        <div className="border-t border-slate-100 pt-3 text-center text-[9px] text-slate-400 leading-relaxed font-semibold">
          <p>Directors: K Holdstock | SAICA (00266911) • KD Watson | SAICA (20024269)</p>
          <p>© {new Date().getFullYear()} Holdstock &amp; Watson Incorporated. All Rights Reserved.</p>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-1 print:hidden">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-md hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
            isSubmitting
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Transmitting Dossier...</span>
            </>
          ) : (
            <>
              <Landmark className="w-3.5 h-3.5" />
              <span>Submit to Holdstock &amp; Watson</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-50 p-2.5 rounded-md border border-red-100 print:hidden">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
};
