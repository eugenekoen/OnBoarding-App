import React from 'react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  steps: string[];
}

export const Header: React.FC<HeaderProps> = ({ currentStep, totalSteps, onStepClick, steps }) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40 transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Brand Logo and Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline select-none">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter">H</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-400 tracking-tighter -ml-1">W</span>
            </div>
            
            <div className="h-8 w-[1.5px] bg-slate-200 hidden sm:block"></div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900">
                  Holdstock &amp; Watson Inc
                </h1>
                <span className="text-[10px] text-slate-700 font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded sm:mt-0 mt-1 self-start">
                  Incorporating KH Financial Services
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Chartered Accountants (SA) • Registered Auditors • Practice No. 954195
              </p>
            </div>
          </div>

          {/* Durban Office Details */}
          <div className="text-right text-[10px] sm:text-[11px] text-slate-600 font-medium md:border-l md:border-slate-200 md:pl-4 leading-normal self-stretch sm:self-auto flex sm:flex-row md:flex-col justify-between sm:justify-start gap-3 sm:gap-6 md:gap-0.5">
            <div>
              <p className="font-semibold text-slate-900">11 Holden Avenue, Windermere, Durban</p>
              <p className="text-slate-400">Access from Montpelier Road</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">TEL | (031) 324 1900</p>
            </div>
          </div>
        </div>

        {/* Stepper Flow Progress Bar */}
        <div className="mt-3 border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;
              
              return (
                <button
                  key={step}
                  onClick={() => onStepClick(stepNumber)}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 group transition-all text-left outline-none ${
                    index === steps.length - 1 ? 'flex-1 justify-end' : 'flex-1'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <div 
                      className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
                        isActive 
                          ? 'bg-slate-900 border-slate-900 text-white ring-3 ring-slate-100 scale-102' 
                          : isCompleted 
                            ? 'bg-slate-700 border-slate-700 text-white' 
                            : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-[1.5px] mx-1.5 bg-slate-100 overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-gradient-to-r from-slate-400 to-slate-900 transition-all duration-500" 
                          style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-0.5 sm:mt-0 text-center sm:text-left">
                    <span 
                      className={`text-[9px] sm:text-[10px] font-bold tracking-tight block uppercase ${
                        isActive 
                          ? 'text-slate-900' 
                          : isCompleted 
                            ? 'text-slate-700' 
                            : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
