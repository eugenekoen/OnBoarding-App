import React from 'react';
import { RequiredServices } from '../types';
import { ShieldCheck, Info, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface ServicesSelectorProps {
  services: RequiredServices;
  onChange: (updatedServices: Partial<RequiredServices>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ServiceMetaData {
  key: keyof Omit<RequiredServices, 'monthlyRetainer'>;
  label: string;
  category: 'Tax & Company Compliance' | 'Payroll & Employee Services' | 'Financial & Auditing';
  description: string;
  hint: string;
}

const SERVICES_METADATA: ServiceMetaData[] = [
  {
    key: 'annualTaxReturns',
    label: 'Annual Tax Returns',
    category: 'Tax & Company Compliance',
    description: 'Filing of annual income tax returns for individuals, companies, trusts, and CCs with SARS.',
    hint: 'All entities and individuals are legally required to submit a tax return annually.'
  },
  {
    key: 'irp6Returns',
    label: 'IRP6 (Prov) Returns',
    category: 'Tax & Company Compliance',
    description: 'Provisional Tax returns (1st & 2nd period) to declare estimated taxable income mid-year.',
    hint: 'Required for all companies and individuals earning non-salary income from multiple sources.'
  },
  {
    key: 'vat201Returns',
    label: 'VAT 201 Returns',
    category: 'Tax & Company Compliance',
    description: 'Bi-monthly or monthly VAT calculations and submissions to SARS.',
    hint: 'Compulsory when vatable taxable turnover exceeds or is likely to exceed R1 million in 12 months.'
  },
  {
    key: 'cipcAnnualReturns',
    label: 'CIPC Annual Returns',
    category: 'Tax & Company Compliance',
    description: 'Filing of annual returns with the Companies and Intellectual Property Commission to keep the entity active.',
    hint: 'Compulsory annual disclosure for all active registered private companies and CCs.'
  },
  {
    key: 'emp201Returns',
    label: 'EMP 201 Returns',
    category: 'Payroll & Employee Services',
    description: 'Monthly payroll tax declaration and payment for PAYE, UIF, and SDL.',
    hint: 'UIF is required if employees work >24 hours/month. SDL is required if annual payroll >R500k.'
  },
  {
    key: 'emp501Returns',
    label: 'EMP 501 Returns / Reconciliations',
    category: 'Payroll & Employee Services',
    description: 'Bi-annual and annual reconciliations of monthly EMP201 tax certificates to issue IRP5 certificates.',
    hint: 'Compulsory for all employers registered for PAYE/UIF.'
  },
  {
    key: 'payrollService',
    label: 'Payroll Service',
    category: 'Payroll & Employee Services',
    description: 'Full-service monthly/weekly processing of payslips, salary calculations, and leave registers.',
    hint: 'Assists in accurate employee deductions, keeping you compliant with the Basic Conditions of Employment Act.'
  },
  {
    key: 'workmensCompReg',
    label: 'Workmen’s Comp Reg (COIDA)',
    category: 'Payroll & Employee Services',
    description: 'Registration and annual declarations with the Compensation Commissioner.',
    hint: 'Legally required for anyone employing one or more full-time or part-time staff.'
  },
  {
    key: 'annualFinancialStatements',
    label: 'Annual Financial Statements (AFS)',
    category: 'Financial & Auditing',
    description: 'Compilation of professional financial statements representing financial performance.',
    hint: 'Essential for tax filing, securing bank loans, shareholder reporting, and CIPC compliance.'
  },
  {
    key: 'annualAudit',
    label: 'Annual Audit',
    category: 'Financial & Auditing',
    description: 'Independent audits of financial records to verify accuracy, internal controls, and compliance.',
    hint: 'Required by law for high-public-interest entities or selected voluntarily for enhanced trust.'
  },
  {
    key: 'managementAccounts',
    label: 'Management Accounts',
    category: 'Financial & Auditing',
    description: 'Monthly or quarterly interim reporting detailing current cashflows, budgets, and balance sheets.',
    hint: 'Used by banks, investors, and management to make proactive, data-backed business decisions.'
  },
  {
    key: 'monthlyBooks',
    label: 'Monthly Books / Bookkeeping',
    category: 'Financial & Auditing',
    description: 'Comprehensive day-to-day transaction recording, bank reconciliations, and trial balance updates.',
    hint: 'Highly recommended if VAT returns are submitted and no internal accounting system exists.'
  }
];

export const ServicesSelector: React.FC<ServicesSelectorProps> = ({ services, onChange, onNext, onBack }) => {
  const [acknowledgedGroup1, setAcknowledgedGroup1] = React.useState(false);
  const [acknowledgedGroup2, setAcknowledgedGroup2] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleCheckboxChange = (key: keyof Omit<RequiredServices, 'monthlyRetainer'>) => {
    onChange({ [key]: !services[key] });
  };

  const handleRetainerChange = (value: 'YES' | 'NO') => {
    onChange({ monthlyRetainer: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledgedGroup1 || !acknowledgedGroup2) {
      setErrorMsg('Please read and confirm understanding of the requirements by checking both confirmation boxes.');
      return;
    }
    setErrorMsg('');
    onNext();
  };

  const categories = ['Tax & Company Compliance', 'Payroll & Employee Services', 'Financial & Auditing'] as const;  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-accent-light border border-accent-border border-l-4 border-accent p-4 rounded-r-md">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-accent-dark shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-brand uppercase tracking-wider">Custom Service Selections</h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Select the professional services you require. Holdstock &amp; Watson Inc offers full-suite tax, compliance, and accounting services tailored to your unique structure. Review the legal requirements for each selection below.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Render Services grouped by Category */}
        {categories.map((cat) => {
          const catServices = SERVICES_METADATA.filter(s => s.category === cat);
          return (
            <div key={cat} className="bg-white rounded-md p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="w-5 h-5 text-brand" />
                <h3 className="text-sm font-bold tracking-wide text-brand uppercase">{cat}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catServices.map((service) => {
                  const isChecked = !!services[service.key];
                  return (
                    <div
                      key={service.key}
                      onClick={() => handleCheckboxChange(service.key)}
                      className={`group p-4 rounded-md border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                        isChecked
                          ? 'border-accent bg-accent-light/30 shadow-xs ring-2 ring-accent/5'
                          : 'border-slate-200 hover:border-accent bg-slate-50/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className={`text-sm font-bold leading-snug ${isChecked ? 'text-brand font-extrabold' : 'text-slate-800'}`}>
                            {service.label}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'bg-accent border-accent text-white'
                                : 'border-slate-300 bg-white group-hover:border-accent'
                            }`}
                          >
                            {isChecked && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-slate-100 flex gap-1.5 items-start">
                        <Info className="w-3.5 h-3.5 text-accent-dark/70 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          {service.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Retainer Package Option */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-bold tracking-wide text-brand uppercase">Retainer Package Option</h3>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Would you like one or more services covered under a monthly retainer?
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Retainers offer priority turnaround and capped monthly billing. Highly recommended for full payroll/bookkeeping suites.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRetainerChange('YES')}
                className={`px-4.5 py-2 text-xs font-bold uppercase rounded-md border tracking-widest transition cursor-pointer ${
                  services.monthlyRetainer === 'YES'
                    ? 'bg-brand border-brand text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => handleRetainerChange('NO')}
                className={`px-4.5 py-2 text-xs font-bold uppercase rounded-md border tracking-widest transition cursor-pointer ${
                  services.monthlyRetainer === 'NO'
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                NO
              </button>
            </div>
          </div>
        </div>

        {/* Legal Acknowledgement Checks */}
        <div className="bg-accent-light/40 border border-accent-border rounded-md p-5 space-y-4">
          <h4 className="text-sm font-bold text-brand uppercase tracking-wider">
            Required Acknowledgements &amp; Terms
          </h4>

          <div className="space-y-3.5">
            {/* Box 1 */}
            <div 
              onClick={() => setAcknowledgedGroup1(!acknowledgedGroup1)}
              className="flex gap-3 items-start select-none cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition ${
                acknowledgedGroup1 ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-white group-hover:border-brand/40'
              }`}>
                {acknowledgedGroup1 && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                I have read and I understand the requirements for <strong>Entities &amp; Individuals</strong> (Annual Tax, Provisional IRP6 Returns, and Annual Financial Statements). I agree that these selections reflect my direct statutory needs.
              </p>
            </div>

            {/* Box 2 */}
            <div 
              onClick={() => setAcknowledgedGroup2(!acknowledgedGroup2)}
              className="flex gap-3 items-start select-none cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition ${
                acknowledgedGroup2 ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-white group-hover:border-brand/40'
              }`}>
                {acknowledgedGroup2 && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                I have read and understand the statutory rules regarding <strong>Employees, Payroll, and VAT</strong> (such as EMP201, COIDA, and the R1 million taxable turnover VAT threshold). I recognize that ensuring active, correct selection is my responsibility.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2.5 text-xs font-bold text-red-800 flex items-center gap-2 animate-pulse mt-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-ping" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onBack}
            className="border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-xs hover:shadow-md transition duration-150 flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Beneficial Owners</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
