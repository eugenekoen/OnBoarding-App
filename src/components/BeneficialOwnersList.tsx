import React, { useState } from 'react';
import { BeneficialOwner, BeneficialOwnerType, IndividualOwner, NonResidentOwner, CompanyOwner } from '../types';
import { User, Globe, Building2, Plus, Trash2, HelpCircle, AlertCircle, Sparkles, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface BeneficialOwnersListProps {
  owners: BeneficialOwner[];
  onAdd: (owner: BeneficialOwner) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BeneficialOwnersList: React.FC<BeneficialOwnersListProps> = ({ owners, onAdd, onRemove, onNext, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [ownerType, setOwnerType] = useState<BeneficialOwnerType>('Individual');
  const [errorMsg, setErrorMsg] = useState('');

  // Individual Form Fields
  const [indName, setIndName] = useState('');
  const [indId, setIndId] = useState('');
  const [indEmail, setIndEmail] = useState('');
  const [indCell, setIndCell] = useState('');

  // Non-Resident Fields
  const [nonResName, setNonResName] = useState('');
  const [nonResPassport, setNonResPassport] = useState('');
  const [nonResDateOfIssue, setNonResDateOfIssue] = useState('');
  const [nonResCountry, setNonResCountry] = useState('');
  const [nonResTaxRef, setNonResTaxRef] = useState('');
  const [nonResNoTaxReason, setNonResNoTaxReason] = useState('');
  const [nonResEmail, setNonResEmail] = useState('');
  const [nonResCell, setNonResCell] = useState('');

  // Company Fields
  const [compName, setCompName] = useState('');
  const [compReg, setCompReg] = useState('');
  const [compContactName, setCompContactName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compCell, setCompCell] = useState('');

  const resetForm = () => {
    setIndName(''); setIndId(''); setIndEmail(''); setIndCell('');
    setNonResName(''); setNonResPassport(''); setNonResDateOfIssue(''); setNonResCountry(''); setNonResTaxRef(''); setNonResNoTaxReason(''); setNonResEmail(''); setNonResCell('');
    setCompName(''); setCompReg(''); setCompContactName(''); setCompEmail(''); setCompCell('');
    setErrorMsg('');
    setIsAdding(false);
  };

  const validateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (ownerType === 'Individual') {
        if (!indName || !indId || !indEmail || !indCell) {
          throw new Error('Please fill in all required fields for the Individual owner.');
        }
        if (indId.length < 5) {
          throw new Error('ID Number seems invalid. Please check.');
        }
        
        const newOwner: IndividualOwner = {
          id: crypto.randomUUID(),
          type: 'Individual',
          fullName: indName,
          idNumber: indId,
          email: indEmail,
          cell: indCell
        };
        onAdd(newOwner);
        
      } else if (ownerType === 'NonResident') {
        if (!nonResName || !nonResPassport || !nonResDateOfIssue || !nonResCountry || !nonResEmail || !nonResCell) {
          throw new Error('Please fill in all required Passport & Contact fields.');
        }
        if (!nonResTaxRef && !nonResNoTaxReason) {
          throw new Error('If no South African or foreign Tax Reference Number exists, a reason must be provided.');
        }

        const newOwner: NonResidentOwner = {
          id: crypto.randomUUID(),
          type: 'NonResident',
          fullName: nonResName,
          email: nonResEmail,
          cell: nonResCell,
          passportNumber: nonResPassport,
          passportDateOfIssue: nonResDateOfIssue,
          passportCountryOfOrigin: nonResCountry,
          taxReferenceNumber: nonResTaxRef || 'N/A',
          noTaxReason: nonResTaxRef ? undefined : nonResNoTaxReason
        };
        onAdd(newOwner);

      } else if (ownerType === 'Company') {
        if (!compName || !compReg || !compContactName || !compEmail || !compCell) {
          throw new Error('Please fill in all required Company corporate details.');
        }

        const newOwner: CompanyOwner = {
          id: crypto.randomUUID(),
          type: 'Company',
          companyName: compName,
          registrationNumber: compReg,
          contactName: compContactName,
          email: compEmail,
          cell: compCell
        };
        onAdd(newOwner);
      }

      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-accent-light border border-accent-border border-l-4 border-accent p-4 rounded-r-md">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-accent-dark shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-brand uppercase tracking-wider">Beneficial Ownership Disclosure</h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              South African financial and CIPC regulations require the disclosure of all beneficial owners (ultimate natural persons holding 5% or more direct/indirect shareholding or control). Declare all applicable owners below.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-4">
        
        {/* Header and Add Button */}
        <div className="flex justify-between items-center bg-white p-4 rounded-md border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-brand uppercase flex items-center gap-2">
              <span>Beneficial Owners Register</span>
              <span className="text-[11px] bg-accent-light text-brand border border-accent-border px-2 py-0.5 rounded-md font-extrabold">
                {owners.length} Added
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Declare individuals, non-resident shareholders, or corporate holding companies.</p>
          </div>

          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Owner</span>
            </button>
          )}
        </div>

        {/* Add Owner Inline Form */}
        {isAdding && (
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs space-y-5 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-extrabold text-brand uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                New Owner Declaration Form
              </span>
              <button 
                type="button" 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Segmented Type Controller */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-md">
              {(['Individual', 'NonResident', 'Company'] as BeneficialOwnerType[]).map((t) => {
                const isSel = ownerType === t;
                const label = t === 'Individual' ? 'SA Citizen' : t === 'NonResident' ? 'Foreign National' : 'Company / Entity';
                const Icon = t === 'Individual' ? User : t === 'NonResident' ? Globe : Building2;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setOwnerType(t); setErrorMsg(''); }}
                    className={`flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition select-none cursor-pointer ${
                      isSel 
                        ? 'bg-brand text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={validateAndAdd} className="space-y-5">
              {/* Type 1: SA Citizen (Individual) */}
              {ownerType === 'Individual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sipho Ndlovu"
                      value={indName}
                      onChange={(e) => setIndName(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      SA ID Number <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="13-digit ID number"
                      value={indId}
                      onChange={(e) => setIndId(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Email <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sipho@domain.co.za"
                      value={indEmail}
                      onChange={(e) => setIndEmail(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Cell <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="082 111 2222"
                      value={indCell}
                      onChange={(e) => setIndCell(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Type 2: Non-Resident Individual */}
              {ownerType === 'NonResident' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. David Miller"
                        value={nonResName}
                        onChange={(e) => setNonResName(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Passport Number <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Passport identification #"
                        value={nonResPassport}
                        onChange={(e) => setNonResPassport(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Passport Date of Issue <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={nonResDateOfIssue}
                        onChange={(e) => setNonResDateOfIssue(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Passport Country of Origin <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. United Kingdom, Germany"
                        value={nonResCountry}
                        onChange={(e) => setNonResCountry(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Email <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@company.com"
                        value={nonResEmail}
                        onChange={(e) => setNonResEmail(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Cell <span className="text-brand font-semibold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+44 20 7946 0958"
                        value={nonResCell}
                        onChange={(e) => setNonResCell(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tax Reference Number <span className="text-slate-400 text-[10px] font-normal">(SA or Overseas, if any)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tax reference #"
                        value={nonResTaxRef}
                        onChange={(e) => setNonResTaxRef(e.target.value)}
                        className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                      />
                    </div>
                    
                    {!nonResTaxRef && (
                      <div className="animate-fade-in">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Why no tax reference number? <span className="text-brand font-semibold">*</span>
                        </label>
                        <textarea
                          rows={1.5}
                          required={!nonResTaxRef}
                          placeholder="Please provide justification"
                          value={nonResNoTaxReason}
                          onChange={(e) => setNonResNoTaxReason(e.target.value)}
                          className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none resize-none transition font-sans"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Type 3: Corporate Shareholder (Company) */}
              {ownerType === 'Company' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Name <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Holdco Proprietary Limited"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registration Number <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2018/987654/07"
                      value={compReg}
                      onChange={(e) => setCompReg(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Representative Contact Name <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Representative's name"
                      value={compContactName}
                      onChange={(e) => setCompContactName(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Email <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="accounts@holdco.co.za"
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Cell <span className="text-brand font-semibold">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="011 444 5555"
                      value={compCell}
                      onChange={(e) => setCompCell(e.target.value)}
                      className="w-full bg-slate-50/40 border border-slate-200 text-slate-900 text-sm rounded-md focus:bg-white focus:ring-1 focus:ring-accent focus:border-accent p-2.5 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-50 p-3 rounded-md border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 animate-bounce" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons inside Add Form */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-brand hover:bg-brand-hover text-white rounded-md transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Add Registry Owner</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Owners List Display */}
        {owners.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md py-12 px-5 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 bg-accent-light text-brand rounded-full flex items-center justify-center mx-auto shadow-xs border border-accent-border">
              <User className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-brand uppercase tracking-wider">No Beneficial Owners Declared Yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add details of ultimate physical or corporate shareholders with voting rights or significant control.
              </p>
            </div>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Beneficial Owner</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {owners.map((owner) => {
              const isInd = owner.type === 'Individual';
              const isNonRes = owner.type === 'NonResident';
              const isComp = owner.type === 'Company';

              return (
                <div
                  key={owner.id}
                  className="bg-white border border-slate-200 rounded-md p-4.5 shadow-xs hover:shadow-md hover:border-accent transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Badge header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        {isInd && (
                          <span className="text-[10px] bg-accent-light text-brand border border-accent-border px-2 py-0.5 rounded font-extrabold uppercase tracking-wider inline-block">
                            SA Citizen Owner
                          </span>
                        )}
                        {isNonRes && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider inline-block">
                            Foreign Owner
                          </span>
                        )}
                        {isComp && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider inline-block">
                            Corporate Holding
                          </span>
                        )}

                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                          {isComp ? (owner as CompanyOwner).companyName : owner.fullName}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(owner.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition cursor-pointer"
                        title="Remove owner"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Meta information lines */}
                    <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
                      {isInd && (
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500">ID Number:</span>
                          <span className="font-bold text-slate-800">{(owner as IndividualOwner).idNumber}</span>
                        </div>
                      )}

                      {isNonRes && (
                        <>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Passport #:</span>
                            <span className="font-bold text-slate-800">{(owner as NonResidentOwner).passportNumber}</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Origin:</span>
                            <span className="font-bold text-slate-800">{(owner as NonResidentOwner).passportCountryOfOrigin}</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Issue Date:</span>
                            <span className="font-bold text-slate-800">{(owner as NonResidentOwner).passportDateOfIssue}</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Tax Ref:</span>
                            <span className="font-bold text-slate-800">{(owner as NonResidentOwner).taxReferenceNumber}</span>
                          </div>
                          {!(owner as NonResidentOwner).taxReferenceNumber || (owner as NonResidentOwner).taxReferenceNumber === 'N/A' ? (
                            <div className="bg-amber-50/70 p-2.5 rounded-md text-[11px] text-slate-600 border border-amber-100 mt-1">
                              <span className="font-bold block uppercase tracking-wider text-amber-800 text-[9px] mb-0.5">Reason No Tax Ref:</span>
                              {(owner as NonResidentOwner).noTaxReason}
                            </div>
                          ) : null}
                        </>
                      )}

                      {isComp && (
                        <>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Reg Number:</span>
                            <span className="font-bold text-slate-800">{(owner as CompanyOwner).registrationNumber}</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-500">Contact:</span>
                            <span className="font-bold text-slate-800">{(owner as CompanyOwner).contactName}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between py-0.5 border-t border-slate-50/50 pt-2 mt-2">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-medium text-slate-850 break-all">{owner.email}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Cell/Mobile:</span>
                        <span className="font-medium text-slate-850">{owner.cell}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          type="button"
          onClick={onNext}
          className="bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-xs hover:shadow-md transition duration-150 flex items-center gap-2 cursor-pointer"
        >
          <span>Proceed to Final Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
