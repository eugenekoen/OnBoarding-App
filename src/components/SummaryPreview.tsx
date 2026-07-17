import React, { useRef, useState } from 'react';
import { OnboardingFormState } from '../types';
import { ArrowLeft, Check, Download, Landmark, Printer, ShieldAlert, Sparkles, UserCheck, Mail, Lock } from 'lucide-react';

interface SummaryPreviewProps {
  state: OnboardingFormState;
  onBack: () => void;
  onSubmitComplete: (referenceNo: string) => void;
}

// Pure mathematical OKLAB to RGB conversion
function oklabToRgb(l: number, a: number, bParam: number, alpha: number = 1): string {
  // OKLAB to LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * bParam;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bParam;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * bParam;
  
  // LMS non-linear to linear
  const lLinear = l_ * l_ * l_;
  const mLinear = m_ * m_ * m_;
  const sLinear = s_ * s_ * s_;
  
  // LMS linear to sRGB linear
  const rLinear = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
  const gLinear = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
  const bLinear = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.7076147010 * sLinear;
  
  // Helper for gamma correction
  const gamma = (x: number): number => {
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  
  // Apply gamma correction, clamp, and round
  const r = Math.max(0, Math.min(255, Math.round(gamma(rLinear) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(gamma(gLinear) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(gamma(bLinear) * 255)));
  
  if (alpha === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Pure mathematical OKLCH to RGB conversion
function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  // Convert Hue to radians
  const hRad = (h * Math.PI) / 180;
  
  // OKLCH to OKLAB
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);
  
  return oklabToRgb(l, aLab, bLab, alpha);
}

// Robust regex parser for oklch colors
function parseOklch(str: string): string {
  const regex = /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg|rad|grad|turn)?)\s*(?:\/\s*([\d.]+%?))?\s*\)/i;
  const match = str.match(regex);
  if (!match) return str;

  try {
    const lStr = match[1];
    const cStr = match[2];
    const hStr = match[3];
    const aStr = match[4];

    const l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    const c = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
    
    let h = parseFloat(hStr);
    if (hStr.endsWith('rad')) {
      h = (parseFloat(hStr) * 180) / Math.PI;
    } else if (hStr.endsWith('turn')) {
      h = parseFloat(hStr) * 360;
    } else if (hStr.endsWith('grad')) {
      h = (parseFloat(hStr) * 9) / 10;
    }

    let alpha = 1;
    if (aStr) {
      alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
    }

    return oklchToRgb(l, c, h, alpha);
  } catch (err) {
    console.warn('Failed to parse oklch color values:', str, err);
    return 'rgba(0, 0, 0, 0)';
  }
}

// Robust regex parser for oklab colors
function parseOklab(str: string): string {
  const regex = /oklab\(\s*([\d.]+%?)\s+([-+]?[\d.]+%?)\s+([-+]?[\d.]+%?)\s*(?:\/\s*([\d.]+%?))?\s*\)/i;
  const match = str.match(regex);
  if (!match) return str;

  try {
    const lStr = match[1];
    const aStr = match[2];
    const bStr = match[3];
    const alphaStr = match[4];

    const l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    const a = aStr.endsWith('%') ? (parseFloat(aStr) / 100) * 0.4 : parseFloat(aStr);
    const b = bStr.endsWith('%') ? (parseFloat(bStr) / 100) * 0.4 : parseFloat(bStr);

    let alpha = 1;
    if (alphaStr) {
      alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
    }

    return oklabToRgb(l, a, b, alpha);
  } catch (err) {
    console.warn('Failed to parse oklab color values:', str, err);
    return 'rgba(0, 0, 0, 0)';
  }
}

const colorConversionCache = new Map<string, string>();

const convertColorToRgb = (colorStr: string): string => {
  if (colorConversionCache.has(colorStr)) {
    return colorConversionCache.get(colorStr)!;
  }

  let tempEl = document.getElementById('html2canvas-color-converter');
  if (!tempEl) {
    tempEl = document.createElement('div');
    tempEl.id = 'html2canvas-color-converter';
    tempEl.style.display = 'none';
    tempEl.style.position = 'absolute';
    tempEl.style.width = '0';
    tempEl.style.height = '0';
    tempEl.style.pointerEvents = 'none';
    document.body.appendChild(tempEl);
  }

  try {
    tempEl.style.color = '';
    tempEl.style.color = colorStr;
    const computedColor = window.getComputedStyle(tempEl).color;
    
    if (computedColor && !computedColor.includes('oklch') && !computedColor.includes('oklab')) {
      colorConversionCache.set(colorStr, computedColor);
      return computedColor;
    }
  } catch (e) {
    // Non-blocking
  }

  let result = colorStr;
  if (colorStr.toLowerCase().includes('oklch')) {
    result = parseOklch(colorStr);
  } else if (colorStr.toLowerCase().includes('oklab')) {
    result = parseOklab(colorStr);
  }
  
  colorConversionCache.set(colorStr, result);
  return result;
};

const convertColorsInString = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  let parsedStr = str;
  if (parsedStr.includes('oklch')) {
    parsedStr = parsedStr.replace(/oklch\([^)]+\)/gi, (match) => {
      return convertColorToRgb(match);
    });
  }
  if (parsedStr.includes('oklab')) {
    parsedStr = parsedStr.replace(/oklab\([^)]+\)/gi, (match) => {
      return convertColorToRgb(match);
    });
  }
  return parsedStr;
};

export const SummaryPreview: React.FC<SummaryPreviewProps> = ({ state, onBack, onSubmitComplete }) => {
  const [signatureName, setSignatureName] = useState(state.clientInfo.contactName || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showEmailInstructions, setShowEmailInstructions] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  
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

    setErrorMsg('');
    setIsSubmitting(true);
    setSubmitStatus('Preparing document for print...');

    const generatedRef = `HW-INT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update state signatures directly before capturing so they show up on the paper sheet PDF
    state.signatures.clientName = signatureName;
    state.signatures.date = new Date().toLocaleDateString('en-ZA');
    state.signatures.acknowledgedTerms = agreedToPrivacy;

    try {
      // 1. Transmit details to Google Sheets if the environment URL is provided
      const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (googleScriptUrl) {
        setSubmitStatus('Transmitting data to Google Sheets...');
        
        // Flatten and format payload for easy integration with Google Sheets row columns
        const payload = {
          referenceNumber: generatedRef,
          submissionDate: state.signatures.date,
          entityType: state.clientInfo.entityType || '',
          entityName: state.clientInfo.entityName || '',
          entityRegistrationNumber: state.clientInfo.entityRegistrationNumber || '',
          contactName: state.clientInfo.contactName || '',
          emailAddress: state.clientInfo.emailAddress || '',
          cellphoneNumber: state.clientInfo.cellphoneNumber || '',
          telephoneNumber: state.clientInfo.telephoneNumber || '',
          registeredAddress: state.clientInfo.registeredAddress || '',
          postalAddress: state.clientInfo.sameAsRegistered 
            ? state.clientInfo.registeredAddress 
            : state.clientInfo.postalAddress || '',
          financialYearEnd: state.clientInfo.financialYearEnd || '',
          referredBy: state.clientInfo.referredBy || '',
          incomeTaxNumber: state.clientInfo.incomeTaxNumber || '',
          vatNumber: state.clientInfo.vatNumber || '',
          payeNumber: state.clientInfo.payeNumber || '',
          uifNumber: state.clientInfo.uifNumber || '',
          sdlNumber: state.clientInfo.sdlNumber || '',
          monthlyRetainer: state.services.monthlyRetainer || 'NO',
          selectedServices: selectedServices.map(s => s.label).join(', '),
          beneficialOwners: state.beneficialOwners.map(owner => {
            const name = owner.type === 'Company' ? owner.companyName : owner.fullName;
            const details = owner.type === 'Individual' ? `ID: ${owner.idNumber}` : 
                            owner.type === 'NonResident' ? `Passport: ${owner.passportNumber} (${owner.passportCountryOfOrigin})` :
                            `Reg: ${owner.registrationNumber}`;
            return `${name} (${owner.type}): ${details}`;
          }).join('; '),
          signatureName: signatureName,
          signatureDate: state.signatures.date
        };

        // We use mode: 'no-cors' since Google Sheets Web App redirects (302) to another origin
        // which triggers CORS blocks. 'no-cors' safely lets the request hit the Google Sheet.
        await fetch(googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        console.warn('VITE_GOOGLE_SCRIPT_URL not configured. Spreadsheet logging skipped.');
      }

      // 2. Open print dialog for vector-quality print/save PDF
      setSubmitStatus('Opening print dialogue...');
      // Wait a tiny moment for DOM to paint the updated signatures
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      window.print();

      // 3. Open beautiful manual email instruction overlay popup
      setGeneratedRefNo(generatedRef);
      setShowEmailInstructions(true);
      setIsSubmitting(false);
      setSubmitStatus('');
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitStatus('');
      setErrorMsg('Failed to complete onboarding submission: ' + (err.message || 'Unknown network error'));
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
      { key: 'beneficialOwnershipTrusts', label: 'Beneficial Ownership Submission - Trusts' },
    ] as const;

    return servicesMap.filter(s => !!state.services[s.key]);
  };

  const selectedServices = getServiceList();  return (
    <div className="space-y-5 animate-fade-in print:bg-white print:p-0 print:m-0">
      

      {/* Onboarding Profile Document Container */}
      <div className="w-full flex flex-col items-center pb-6 print:pb-0">
        <div 
          id="onboarding-profile-document" 
          className="w-full max-w-[210mm] bg-white shadow-md border border-slate-200 p-[15mm] md:p-[20mm] flex flex-col space-y-6 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none"
        >
          {/* Constant Header */}
          <div className="border-b border-slate-350 pb-3 flex justify-between items-end">
            <div>
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
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-right hidden sm:block">
              Client Onboarding Intake
            </div>
          </div>
        
          {/* Title */}
          <div className="text-center">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-brand border-b border-slate-100 pb-2 max-w-sm mx-auto">
              Client Intake &amp; Onboarding Profile
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 font-bold">Generated: {new Date().toLocaleDateString('en-ZA')}</p>
          </div>

            {/* Section 1: Entity Structure */}
            <div className="space-y-3 print:break-inside-avoid">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
                1. Entity Structure
              </h3>
              
              <div className="grid grid-cols-3 gap-y-3.5 gap-x-4 text-xs bg-slate-50/40 p-3.5 rounded-md border border-slate-200">
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
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Financial Year End:</span>
                  <span className="font-bold text-slate-900 text-sm">{state.clientInfo.financialYearEnd || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Referred By:</span>
                  <span className="font-medium text-slate-900 text-sm">{state.clientInfo.referredBy || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Correspondence */}
            <div className="space-y-3 print:break-inside-avoid">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
                2. Contact &amp; Correspondence
              </h3>
              
              <div className="grid grid-cols-3 gap-y-3.5 gap-x-4 text-xs bg-slate-50/40 p-3.5 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Primary Contact Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{state.clientInfo.contactName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Cellphone Number:</span>
                  <span className="font-bold text-slate-900 text-sm">{state.clientInfo.cellphoneNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Landline Number:</span>
                  <span className="font-medium text-slate-900 text-sm">{state.clientInfo.telephoneNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Email Address:</span>
                  <span className="font-bold text-slate-900 text-sm break-all">{state.clientInfo.emailAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Registered Address:</span>
                  <span className="font-medium text-slate-900 text-xs whitespace-pre-wrap">{state.clientInfo.registeredAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Postal Address:</span>
                  <span className="font-medium text-slate-900 text-xs whitespace-pre-wrap">
                    {state.clientInfo.sameAsRegistered ? 'Same as Physical Address' : state.clientInfo.postalAddress || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Statutory Tax References */}
            <div className="space-y-3 print:break-inside-avoid">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
                3. Statutory Tax Registrations
              </h3>
              
              <div className="grid grid-cols-5 gap-3 text-xs bg-slate-50/40 p-3.5 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Income Tax:</span>
                  <span className="font-extrabold text-brand font-mono text-[11px]">{state.clientInfo.incomeTaxNumber || 'Not Registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">VAT Number:</span>
                  <span className="font-extrabold text-brand font-mono text-[11px]">{state.clientInfo.vatNumber || 'Not Registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">PAYE Number:</span>
                  <span className="font-extrabold text-brand font-mono text-[11px]">{state.clientInfo.payeNumber || 'Not Registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">UIF Number:</span>
                  <span className="font-extrabold text-brand font-mono text-[11px]">{state.clientInfo.uifNumber || 'Not Registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">SDL Number:</span>
                  <span className="font-extrabold text-brand font-mono text-[11px]">{state.clientInfo.sdlNumber || 'Not Registered'}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Selected Financial Services */}
            <div className="space-y-3 print:break-inside-avoid">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
                4. Selected Financial Services
              </h3>
              
              {selectedServices.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-md">No services selected.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedServices.map(s => (
                    <div key={s.key} className="flex items-center gap-2 bg-slate-50/40 border border-slate-200 p-2 rounded-md text-xs text-slate-850">
                      <span className="w-4 h-4 rounded-full bg-accent-light text-brand border border-accent-border flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </span>
                      <span className="font-bold text-[11px]">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-brand text-white p-3 rounded-md text-xs flex justify-between items-center shadow-xs">
                <span className="uppercase font-bold tracking-widest text-[9px]">Monthly Retainer Request:</span>
                <span className="text-brand bg-white px-2.5 py-0.5 rounded font-extrabold tracking-wider text-[11px]">
                  {state.services.monthlyRetainer}
                </span>
              </div>
            </div>

            {/* Section 5: Beneficial Owners Register */}
            <div className="space-y-3 print:break-inside-avoid">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2">
                5. Beneficial Ownership Register
              </h3>
              
              {state.beneficialOwners.length === 0 ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 flex gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                  <p className="font-semibold leading-relaxed text-[11px]">
                    No Beneficial Owners have been declared on this form. Note that for private companies, declaring ultimate beneficiaries is required for compliance with South African laws.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand text-white border-b border-brand text-[9px]">
                        <th className="p-2.5 font-bold uppercase tracking-wider">Owner / Representative</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider">Type / Citizenship</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider">Identification / Reg</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider">Contact Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.beneficialOwners.map((owner) => (
                        <tr key={owner.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900 text-xs block">
                              {owner.type === 'Company' ? owner.companyName : owner.fullName}
                            </span>
                            {owner.type === 'Company' && (
                              <span className="block text-[9px] text-slate-500 font-medium">Rep: {owner.contactName}</span>
                            )}
                          </td>
                          <td className="p-2.5 uppercase font-bold text-[9px]">
                            {owner.type === 'Individual' && <span className="text-brand bg-accent-light border border-accent-border px-1.5 py-0.5 rounded">SA Citizen</span>}
                            {owner.type === 'NonResident' && <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Foreign National</span>}
                            {owner.type === 'Company' && <span className="text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">Corporate Shareholder</span>}
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-800">
                            {owner.type === 'Individual' && `ID: ${owner.idNumber}`}
                            {owner.type === 'NonResident' && (
                              <div className="space-y-0.5">
                                <span className="font-bold block">Passport: {owner.passportNumber} ({owner.passportCountryOfOrigin})</span>
                                <span className="block text-[9px] text-slate-500 font-sans">Tax Ref: {owner.taxReferenceNumber}</span>
                                {owner.taxReferenceNumber === 'N/A' && (
                                  <span className="block text-[8px] text-slate-450 font-sans italic">Reason: {owner.noTaxReason}</span>
                                )}
                              </div>
                            )}
                            {owner.type === 'Company' && `Reg: ${owner.registrationNumber}`}
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px]">
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

            {/* Privacy & POPIA Compliance */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-md space-y-1.5 text-[11px] leading-relaxed print:break-inside-avoid">
              <h4 className="font-extrabold text-brand uppercase tracking-wider text-xs">Privacy Statement &amp; POPIA Compliance</h4>
              <p className="text-slate-600">
                By completing this form and submitting it, you choose to agree to our Privacy Policy Statement regarding the way we collect and process your personal information. Should you like a copy of our Privacy Policy Statement, please let us know.
              </p>
              <p className="text-slate-400 italic text-[9px]">
                Please note that it is the client’s responsibility to ensure that all requested services are selected to ensure full transparency between us and the client. Should you require any services added or removed, please contact us and we shall do so.
              </p>
            </div>


            {/* Signature Line Area */}
            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Authorized Onboarding Signature</h4>
                
                <div className="space-y-3 text-[11px]">
                  <p className="text-slate-600 leading-relaxed">
                    I warrant that I am duly authorized to complete this client onboarding application and select compliance services for this entity.
                  </p>
                  
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="rounded border-slate-350 text-brand focus:ring-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-[11px] font-bold text-slate-800 cursor-pointer select-none">
                      I agree to the privacy statement and confirm all selections. <span className="text-brand font-semibold">*</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Representative Full Name <span className="text-brand font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => {
                      setSignatureName(e.target.value);
                    }}
                    placeholder="Type your full name to sign"
                    className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-xs rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2 outline-none font-bold placeholder:font-normal transition"
                  />
                </div>
              </div>
            </div>
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
          disabled={isSubmitting}
          className={`font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs ${
            isSubmitting
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-brand hover:bg-brand-hover text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{submitStatus || 'Transmitting Dossier...'}</span>
            </>
          ) : (
            <>
              <Landmark className="w-4 h-4" />
              <span>Submit &amp; Print PDF</span>
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

      {/* Manual Email Transmission Overlay Instructions Modal */}
      {showEmailInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-sm w-full overflow-hidden relative animate-scale-up">
            {/* Top brand accent bar */}
            <div className="h-1.5 bg-brand" />
            
            <div className="p-6 md:p-8 space-y-5 text-center">
              {/* Check icon */}
              <div className="w-14 h-14 bg-accent-light border border-accent-border text-accent-dark rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-brand tracking-tight">
                  Form Dossier Compiled Successfully!
                </h3>
                <p className="text-[10px] text-slate-500">
                  Your unique reference number is: <strong className="font-mono text-slate-800">{generatedRefNo}</strong>
                </p>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmailInstructions(false)}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Proceed to Finish</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
