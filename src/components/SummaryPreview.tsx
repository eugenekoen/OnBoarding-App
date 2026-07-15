import React, { useRef, useState } from 'react';
import { OnboardingFormState } from '../types';
import { ArrowLeft, Check, Download, Landmark, Printer, ShieldAlert, Sparkles, UserCheck, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { generateEmailHtml } from '../lib/emailTemplate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SummaryPreviewProps {
  state: OnboardingFormState;
  onBack: () => void;
  onSubmitComplete: (referenceNo: string) => void;
}

// Pure mathematical OKLCH to RGB conversion
function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  // Convert Hue to radians
  const hRad = (h * Math.PI) / 180;
  
  // OKLCH to OKLAB
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);
  
  // OKLAB to LMS
  const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;
  
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

const colorConversionCache = new Map<string, string>();

const convertOklchToRgb = (colorStr: string): string => {
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
    
    if (computedColor && !computedColor.includes('oklch')) {
      colorConversionCache.set(colorStr, computedColor);
      return computedColor;
    }
  } catch (e) {
    // Non-blocking
  }

  const result = parseOklch(colorStr);
  colorConversionCache.set(colorStr, result);
  return result;
};

const convertOklchInString = (str: string): string => {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }
  return str.replace(/oklch\([^)]+\)/gi, (match) => {
    return convertOklchToRgb(match);
  });
};

export const SummaryPreview: React.FC<SummaryPreviewProps> = ({ state, onBack, onSubmitComplete }) => {
  const [signatureName, setSignatureName] = useState(state.clientInfo.contactName || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showEmailInstructions, setShowEmailInstructions] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  
  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async (refNo: string): Promise<boolean> => {
    const element = document.getElementById('onboarding-dossier-paper');
    if (!element) {
      console.error('onboarding-dossier-paper element not found');
      return false;
    }

    const originalGetComputedStyle = window.getComputedStyle;
    let isPatched = false;

    try {
      // Patch getComputedStyle to intercept oklch colors and convert them to standard RGB/RGBA on the fly.
      // This completely bypasses html2canvas's unsupported "oklch" color function parsing bug!
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = Reflect.get(target, prop);
            
            if (typeof val === 'string' && val.includes('oklch')) {
              return convertOklchInString(val);
            }
            
            if (typeof val === 'function') {
              return function(...args: any[]) {
                const res = val.apply(target, args);
                if (typeof res === 'string' && res.includes('oklch')) {
                  return convertOklchInString(res);
                }
                return res;
              };
            }
            
            return val;
          }
        });
      };
      isPatched = true;

      // Temporarily hide elements with 'print:hidden' if they are inside the capture area
      const canvas = await html2canvas(element, {
        scale: 2, // Retains high quality print resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 297; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Render first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Handle multi-page overflow
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const entityName = state.clientInfo.entityName ? state.clientInfo.entityName.replace(/[^a-zA-Z0-9]/g, '_') : 'Client';
      pdf.save(`HW-Onboarding-${entityName}-${refNo}.pdf`);
      return true;
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      return false;
    } finally {
      if (isPatched) {
        window.getComputedStyle = originalGetComputedStyle;
      }
    }
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
    setSubmitStatus('Initializing secure submission...');

    const generatedRef = `HW-INT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const entityName = state.clientInfo.entityName || "New Entity";
    const subject = `Holdstock & Watson Client Onboarding [REF: ${generatedRef}] - ${entityName}`;

    // Update state signatures directly before capturing so they show up on the paper sheet PDF
    state.signatures.clientName = signatureName;
    state.signatures.date = new Date().toLocaleDateString('en-ZA');
    state.signatures.acknowledgedTerms = agreedToPrivacy;

    try {
      // 1. Check if Supabase credentials are configured in the environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const useSupabase = supabaseUrl && 
                          supabaseUrl !== "https://your-project-id.supabase.co" && 
                          supabaseUrl.trim() !== "" &&
                          supabaseAnonKey && 
                          supabaseAnonKey.trim() !== "";

      if (useSupabase) {
        setSubmitStatus('Archiving dossier in database...');
        try {
          // Save the onboarding application data directly into the Supabase database
          await supabase
            .from('submissions')
            .insert({
              reference_no: generatedRef,
              entity_name: state.clientInfo.entityName || "New Entity",
              client_email: state.clientInfo.emailAddress,
              form_data: state,
              created_at: new Date().toISOString()
            });
          console.log('Record successfully archived in Supabase database.');
        } catch (dbErr) {
          console.warn('Non-blocking Supabase archive error:', dbErr);
        }
      } else {
        // If local preview, try local express backend, but ignore failure if it returns 405 (like on static Github Pages)
        if (!window.location.hostname.endsWith('github.io')) {
          setSubmitStatus('Transmitting data to backend server...');
          try {
            await fetch('api/submit-onboarding', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ state, referenceNo: generatedRef }),
            });
          } catch (localErr) {
            console.log('Local backend fallback error (ignored on static environments):', localErr);
          }
        }
      }

      // 2. Generate and Download PDF client-side (extremely reliable and works perfectly on GitHub Pages!)
      setSubmitStatus('Compiling compliance PDF dossier...');
      // Wait a tiny moment for DOM to paint the updated signatures
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const pdfSuccess = await generatePDF(generatedRef);
      if (!pdfSuccess) {
        throw new Error('Could not compile PDF document. Please try printing via "Print Form" above.');
      }

      // 3. Open beautiful manual email instruction overlay popup instead of failing on email delivery
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
      <div id="onboarding-dossier-paper" className="bg-white border border-slate-200 shadow-xs rounded-md overflow-hidden p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
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

        {/* Section 5: Automated Email Transmission Service */}
        <div className="border-t border-slate-200 pt-5 space-y-3.5">
          <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-l-2 border-accent pl-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            5. Automated Email Transmission Service
          </h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            Upon submitting this dossier, our automated server system will transmit a digital transcript of the completed form directly to your email address (<strong className="text-brand">{state.clientInfo.emailAddress || 'Not entered'}</strong>).
          </p>
          <p className="text-xs text-slate-650 leading-relaxed">
            In addition, a secure compliance-quality notification copy will be automatically archived with the practice at <strong className="text-brand font-bold">eugenekoenn@gmail.com</strong>.
          </p>
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
              <span>Submit &amp; Download PDF</span>
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
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden relative animate-scale-up">
            {/* Top gold brand accent bar */}
            <div className="h-1.5 bg-brand" />
            
            <div className="p-6 md:p-8 space-y-5 text-center">
              {/* Dynamic bounce icon */}
              <div className="w-14 h-14 bg-accent-light border border-accent-border text-brand rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <Download className="w-7 h-7 text-accent-dark animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-accent-dark font-extrabold tracking-wider uppercase">
                  PDF Generated &amp; Saved
                </span>
                <h3 className="text-lg font-extrabold text-brand tracking-tight">
                  Form Dossier Compiled Successfully!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  To complete your onboarding, please email the downloaded PDF file directly to our client admissions partner:
                </p>
              </div>

              {/* Recipient box */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2.5 max-w-sm mx-auto">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider mb-1">Email Recipient:</span>
                  <span className="text-sm font-mono font-bold text-brand bg-white px-3.5 py-1.5 rounded border border-slate-200 shadow-xs select-all">
                    eugene@khfs.co.za
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('eugene@khfs.co.za');
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="mx-auto text-[10px] text-accent hover:text-accent-dark font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Copy Email Address</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reference badge */}
              <p className="text-[10px] text-slate-500">
                Your unique reference number is: <strong className="font-mono text-slate-800">{generatedRefNo}</strong>
              </p>

              {/* Action row */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => generatePDF(generatedRefNo)}
                  className="sm:flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Download Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailInstructions(false);
                    onSubmitComplete(generatedRefNo);
                  }}
                  className="sm:flex-1 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
