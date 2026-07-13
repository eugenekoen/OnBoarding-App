import React, { useState, useEffect } from 'react';
import { OnboardingFormState, ClientInformation, RequiredServices, BeneficialOwner } from './types';
import { Header } from './components/Header';
import { ClientInfoForm } from './components/ClientInfoForm';
import { ServicesSelector } from './components/ServicesSelector';
import { BeneficialOwnersList } from './components/BeneficialOwnersList';
import { SummaryPreview } from './components/SummaryPreview';
import { SuccessView } from './components/SuccessView';
import { ShieldCheck, PhoneCall, Trash2, Mail, Info, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'hw_onboarding_draft_v1';

const INITIAL_CLIENT_INFO: ClientInformation = {
  entityType: 'Company',
  entityName: '',
  entityRegistrationNumber: '',
  contactName: '',
  incomeTaxNumber: '',
  vatNumber: '',
  cellphoneNumber: '',
  payeNumber: '',
  uifNumber: '',
  telephoneNumber: '',
  sdlNumber: '',
  referredBy: '',
  emailAddress: '',
  registeredAddress: '',
  postalAddress: '',
  financialYearEnd: '',
  sameAsRegistered: false
};

const INITIAL_SERVICES_INFO: RequiredServices = {
  annualTaxReturns: false,
  irp6Returns: false,
  vat201Returns: false,
  annualAudit: false,
  annualFinancialStatements: false,
  managementAccounts: false,
  workmensCompReg: false,
  payrollService: false,
  monthlyBooks: false,
  emp201Returns: false,
  emp501Returns: false,
  cipcAnnualReturns: false,
  monthlyRetainer: 'NO'
};

const INITIAL_STATE: OnboardingFormState = {
  clientInfo: INITIAL_CLIENT_INFO,
  beneficialOwners: [],
  services: INITIAL_SERVICES_INFO,
  signatures: {
    clientName: '',
    date: '',
    acknowledgedTerms: false
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formState, setFormState] = useState<OnboardingFormState>(INITIAL_STATE);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // Load from LocalStorage Draft on startup
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Basic schema compatibility check
        if (parsed && parsed.clientInfo) {
          setFormState(parsed);
          setLoadedFromCache(true);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached onboarding draft:', e);
    }
  }, []);

  // Save to LocalStorage Draft whenever state changes
  useEffect(() => {
    if (formState !== INITIAL_STATE) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formState));
    }
  }, [formState]);

  const handleClientInfoChange = (updated: Partial<ClientInformation>) => {
    setFormState((prev) => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...updated }
    }));
  };

  const handleServicesChange = (updated: Partial<RequiredServices>) => {
    setFormState((prev) => ({
      ...prev,
      services: { ...prev.services, ...updated }
    }));
  };

  const handleAddOwner = (owner: BeneficialOwner) => {
    setFormState((prev) => ({
      ...prev,
      beneficialOwners: [...prev.beneficialOwners, owner]
    }));
  };

  const handleRemoveOwner = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      beneficialOwners: prev.beneficialOwners.filter((o) => o.id !== id)
    }));
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to clear your onboarding draft and start over?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setFormState(INITIAL_STATE);
      setCurrentStep(1);
      setReferenceNumber(null);
      setLoadedFromCache(false);
    }
  };

  const handleStepClick = (step: number) => {
    // Only allow navigating forward to steps that are logical or backward
    setCurrentStep(step);
  };

  const handleSubmissionComplete = (ref: string) => {
    // Clear draft storage upon successful final submit
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setReferenceNumber(ref);
  };

  const handleResetAfterSuccess = () => {
    setFormState(INITIAL_STATE);
    setCurrentStep(1);
    setReferenceNumber(null);
  };

  const steps = [
    '1. Entity Profile',
    '2. Services Guide',
    '3. Beneficial Owners',
    '4. Review & Sign'
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      
      {/* Top Advisory Banner */}
      <div className="bg-slate-950 text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-1.5 select-none print:hidden">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Official Secure Onboarding Portal</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">POPIA Compliant Secure Channel</span>
      </div>

      {/* Header with Nav stepper */}
      {!referenceNumber && (
        <Header
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={handleStepClick}
          steps={steps}
        />
      )}

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-4">
        
        {/* Draft cache indicator banner */}
        {loadedFromCache && !referenceNumber && (
          <div className="mb-4 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-xs flex justify-between items-center print:hidden">
            <span className="font-semibold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600 shrink-0" />
              Progress auto-saved. Resumed from draft.
            </span>
            <button
              onClick={handleResetForm}
              className="text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50 px-2 py-0.5 rounded cursor-pointer transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Form
            </button>
          </div>
        )}

        {/* Dynamic step router */}
        <div className="space-y-4">
          {referenceNumber ? (
            <SuccessView
              referenceNo={referenceNumber}
              state={formState}
              onReset={handleResetAfterSuccess}
            />
          ) : (
            <div>
              {currentStep === 1 && (
                <ClientInfoForm
                  data={formState.clientInfo}
                  onChange={handleClientInfoChange}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              
              {currentStep === 2 && (
                <ServicesSelector
                  services={formState.services}
                  onChange={handleServicesChange}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <BeneficialOwnersList
                  owners={formState.beneficialOwners}
                  onAdd={handleAddOwner}
                  onRemove={handleRemoveOwner}
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && (
                <SummaryPreview
                  state={formState}
                  onBack={() => setCurrentStep(3)}
                  onSubmitComplete={handleSubmissionComplete}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Interactive client care support footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 print:hidden select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-medium">
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-800 animate-pulse" />
            <span className="font-bold text-slate-800">Holdstock &amp; Watson Onboarding Desk</span>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            <a href="tel:0313241900" className="flex items-center gap-1 hover:text-slate-800 transition">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>Durban Office: (031) 324 1900</span>
            </a>
            <a href="mailto:onboarding@holdstock.co.za" className="flex items-center gap-1 hover:text-slate-800 transition">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>onboarding@holdstock.co.za</span>
            </a>
          </div>

          <div>
            <span>SAICA Accredited Practice No. 954195</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
