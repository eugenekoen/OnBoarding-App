import React, { useRef, useState, useEffect } from 'react';
import { OnboardingFormState } from '../types';
import { ArrowLeft, Check, Download, Landmark, Printer, ShieldAlert, Sparkles, UserCheck, Mail, LogOut, Lock } from 'lucide-react';
import { initAuth, googleSignIn, logout, sendOnboardingEmail } from '../lib/firebaseAuth';
import { User } from 'firebase/auth';

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

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Google authentication failed: ' + (err.message || err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
    } catch (err: any) {
      console.error(err);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) {
      setErrorMsg('Please enter your full name in the authorized sign-off box.');
      return;
    }
    if (!agreedToPrivacy) {
      setErrorMsg('Please review and tick the Privacy Policy & Data Processing consent checkbox.');
      return;
    }
    if (!token) {
      setErrorMsg('Please authorize Gmail by signing in with Google below before submitting.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const generatedRef = `HW-INT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Real email transmission via Google Workspace Gmail API
      await sendOnboardingEmail(token, state, generatedRef);
      
      // Update state signatures to keep final transcript in sync
      state.signatures.clientName = signatureName;
      state.signatures.date = new Date().toLocaleDateString('en-ZA');
      state.signatures.acknowledgedTerms = agreedToPrivacy;

      setIsSubmitting(false);
      onSubmitComplete(generatedRef);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('Failed to transmit onboarding email via Gmail: ' + (err.message || 'Unknown network error') + '. Please try reconnecting Google.');
    }
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
    <div className="space-y-5 animate-fade-in print:bg-white print:p-0 print:m-0">
      
      {/* Alert banner */}
      <div className="bg-accent-light border border-accent-border border-l-4 border-accent p-4 rounded-r-md print:hidden">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div className="flex gap-3">
            <UserCheck className="w-5 h-5 text-accent-dark shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-brand uppercase tracking-wider">Review &amp; Sign Off</h4>
              <p className="text-xs text-slate-700 mt-1">
                Verify that all information is complete. You can download or print this document at any stage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-md flex items-center gap-2 cursor-pointer shadow-xs self-end md:self-auto transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* Corporate Document Mock Paper sheet layout */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-md overflow-hidden p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header - Authentic SA letterhead design */}
        <div className="flex justify-between items-start border-b border-slate-350 pb-5 gap-6">
          <div>
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-extrabold text-brand tracking-tighter">H</span>
              <span className="text-4xl font-extrabold text-accent tracking-tighter -ml-1">W</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-brand">
              Holdstock &amp; Watson Inc
            </h1>
            <p className="text-[11px] text-brand font-bold tracking-wide uppercase">
              Chartered Accountants (SA) &amp; Registered Auditors
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Incorporating KH Financial Services • Practice Number: 954195
            </p>
          </div>

          <div className="text-right text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-900">11 Holden Avenue, Windermere</p>
            <p>Access from Montpelier Road, Durban</p>
            <p className="font-bold text-slate-900">P.O. Box 5107, Durban, 4000</p>
            <p>TEL | (031) 324 1900</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-brand border-b border-slate-100 pb-2 max-w-sm mx-auto">
            Client Intake &amp; Onboarding Profile
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 font-bold">Generated: {new Date().toLocaleDateString('en-ZA')}</p>
        </div>

        {/* Section 1: Entity & Contact Profile */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
            1. Entity Structure &amp; Contacts
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-5 text-xs bg-slate-50/40 p-4 rounded-md border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Entity Type:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.entityType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Registered Entity Name:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.entityName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Registration Number:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.entityRegistrationNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Primary Contact Name:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.contactName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Cellphone Number:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.cellphoneNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Email Address:</span>
              <span className="font-bold text-slate-900 text-sm break-all">{state.clientInfo.emailAddress || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Landline Number:</span>
              <span className="font-medium text-slate-900 text-sm">{state.clientInfo.telephoneNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Financial Year End:</span>
              <span className="font-bold text-slate-900 text-sm">{state.clientInfo.financialYearEnd || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Referred By:</span>
              <span className="font-medium text-slate-900 text-sm">{state.clientInfo.referredBy || '—'}</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Registered Address:</span>
              <span className="font-medium text-slate-900 text-xs whitespace-pre-wrap">{state.clientInfo.registeredAddress || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Postal Address:</span>
              <span className="font-medium text-slate-900 text-xs whitespace-pre-wrap">
                {state.clientInfo.sameAsRegistered ? 'Same as Physical Address' : state.clientInfo.postalAddress || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Tax References */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
            2. Statutory Tax Registrations
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs bg-slate-50/40 p-4 rounded-md border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Income Tax:</span>
              <span className="font-extrabold text-brand font-mono text-sm">{state.clientInfo.incomeTaxNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">VAT Number:</span>
              <span className="font-extrabold text-brand font-mono text-sm">{state.clientInfo.vatNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">PAYE Number:</span>
              <span className="font-extrabold text-brand font-mono text-sm">{state.clientInfo.payeNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">UIF Number:</span>
              <span className="font-extrabold text-brand font-mono text-sm">{state.clientInfo.uifNumber || 'Not Registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">SDL Number:</span>
              <span className="font-extrabold text-brand font-mono text-sm">{state.clientInfo.sdlNumber || 'Not Registered'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Services Requested */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
            3. Selected Financial Services
          </h3>
          
          {selectedServices.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-md">No services selected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedServices.map(s => (
                <div key={s.key} className="flex items-center gap-2 bg-slate-50/40 border border-slate-200 p-2.5 rounded-md text-xs text-slate-850">
                  <span className="w-5 h-5 rounded-full bg-accent-light text-brand border border-accent-border flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[4]" />
                  </span>
                  <span className="font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-brand text-white p-3.5 rounded-md text-xs flex justify-between items-center shadow-xs">
            <span className="uppercase font-bold tracking-widest text-[10px]">Monthly Retainer Request:</span>
            <span className="text-brand bg-white px-3 py-1 rounded font-extrabold tracking-wider text-xs">
              {state.services.monthlyRetainer}
            </span>
          </div>
        </div>

        {/* Section 4: Beneficial Owners Register */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
            4. Beneficial Ownership Register
          </h3>
          
          {state.beneficialOwners.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 flex gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                No Beneficial Owners have been declared on this form. Note that for private companies, declaring ultimate beneficiaries is required for compliance with modern South African laws.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand text-white border-b border-brand text-[10px]">
                    <th className="p-3 font-bold uppercase tracking-wider">Owner / Representative</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Type / Citizenship</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Identification / Reg</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Contact Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.beneficialOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 text-sm block">
                          {owner.type === 'Company' ? owner.companyName : owner.fullName}
                        </span>
                        {owner.type === 'Company' && (
                          <span className="block text-[10px] text-slate-500 font-medium">Rep: {owner.contactName}</span>
                        )}
                      </td>
                      <td className="p-3 uppercase font-bold text-[10px]">
                        {owner.type === 'Individual' && <span className="text-brand bg-accent-light border border-accent-border px-2 py-0.5 rounded">SA Citizen</span>}
                        {owner.type === 'NonResident' && <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Foreign National</span>}
                        {owner.type === 'Company' && <span className="text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">Corporate Shareholder</span>}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">
                        {owner.type === 'Individual' && `ID: ${owner.idNumber}`}
                        {owner.type === 'NonResident' && (
                          <div className="space-y-1">
                            <span className="font-bold block">Passport: {owner.passportNumber} ({owner.passportCountryOfOrigin})</span>
                            <span className="block text-[10px] text-slate-500 font-sans">Tax Ref: {owner.taxReferenceNumber}</span>
                            {owner.taxReferenceNumber === 'N/A' && (
                              <span className="block text-[9px] text-slate-450 font-sans italic">Reason: {owner.noTaxReason}</span>
                            )}
                          </div>
                        )}
                        {owner.type === 'Company' && `Reg: ${owner.registrationNumber}`}
                      </td>
                      <td className="p-3 text-slate-600 text-xs">
                        <p className="font-medium text-slate-800">{owner.email}</p>
                        <p className="text-slate-500">{owner.cell}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy & Compliance Notice */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-md space-y-2 text-xs leading-relaxed">
          <h4 className="font-extrabold text-brand uppercase tracking-wider">Privacy Statement &amp; POPIA Compliance</h4>
          <p className="text-slate-600">
            By completing this form and submitting it, you choose to agree to our Privacy Policy Statement regarding the way we collect and process your personal information. Should you like a copy of our Privacy Policy Statement, please let us know.
          </p>
          <p className="text-slate-400 italic text-[10px]">
            Please note that it is the client’s responsibility to ensure that all requested services are selected to ensure full transparency between us and the client. Should you require any services added or removed, please contact us and we shall do so.
          </p>
        </div>

        {/* Section 5: Secure Gmail Sender Configuration */}
        <div className="border-t border-slate-200 pt-5 space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            5. Secure Gmail Email Dispatcher
          </h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            To ensure secure, verifiable email transmission of this completed onboarding form, this portal sends the final PDF-quality dossier directly from <strong>your personal Gmail account</strong> to both yourself (<strong className="text-brand">{state.clientInfo.emailAddress || 'Not entered'}</strong>) and Holdstock &amp; Watson Inc (<strong className="text-brand font-bold">onboarding@holdstock.co.za</strong>).
          </p>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
            {!token ? (
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Connect your Gmail account to enable automatic and secure direct mailing of the onboarding form.</span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="flex items-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs uppercase tracking-wider px-4 py-2.5 rounded-md shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span className="font-bold">{isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Google Profile" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-emerald-300" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Authenticated via Gmail
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="text-slate-650 hover:text-slate-900 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-md transition cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Signature Line Area */}
        <div className="border-t border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-2.5">Authorized Onboarding Signature</h4>
            
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                I warrant that I am duly authorized to complete this client onboarding application and select compliance services for this entity.
              </p>
              
              <div className="flex gap-2.5 items-center">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="rounded border-slate-350 text-brand focus:ring-accent h-4 w-4 cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  I agree to the privacy statement and confirm all selections. <span className="text-brand font-semibold">*</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Representative Full Name <span className="text-brand font-semibold">*</span>
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => {
                  setSignatureName(e.target.value);
                  setTypedSignature(e.target.value);
                }}
                placeholder="Type your full name to sign"
                className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none font-bold placeholder:font-normal transition"
              />
            </div>

            {typedSignature && (
              <div className="bg-accent-light p-4 rounded-md border border-dashed border-accent text-center select-none animate-fade-in shadow-xs">
                <span className="text-brand text-[10px] uppercase font-bold block mb-1 tracking-wider">Generated Electronic Stamp</span>
                <span className="font-serif italic text-2xl text-brand tracking-wide block py-1">
                  {typedSignature}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Date signed: {new Date().toLocaleDateString('en-ZA')} • Secured Onboarding Stamp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info matching physical document */}
        <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 leading-relaxed font-semibold">
          <p>Directors: K Holdstock | SAICA (00266911) • KD Watson | SAICA (20024269)</p>
          <p>© {new Date().getFullYear()} Holdstock &amp; Watson Incorporated. All Rights Reserved.</p>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2 print:hidden">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !token}
          className={`font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs ${
            isSubmitting
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : !token
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-200'
              : 'bg-brand hover:bg-brand-hover text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Transmitting Dossier...</span>
            </>
          ) : (
            <>
              <Landmark className="w-4 h-4" />
              <span>Submit to Holdstock &amp; Watson</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-50 p-3 rounded-md border border-red-100 print:hidden animate-bounce">
          <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
};
