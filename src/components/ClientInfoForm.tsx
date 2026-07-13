import React from 'react';
import { ClientInformation, EntityType } from '../types';
import { Building2, Landmark, HelpCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

interface ClientInfoFormProps {
  data: ClientInformation;
  onChange: (updatedData: Partial<ClientInformation>) => void;
  onNext: () => void;
}

const ENTITY_TYPES: { value: EntityType; label: string; description: string }[] = [
  { value: 'Company', label: 'Company (Pty) Ltd', description: 'Standard private company' },
  { value: 'Close Corporation', label: 'Close Corporation (CC)', description: 'Legacy corporate entity' },
  { value: 'Trust', label: 'Trust', description: 'Family, business or testamentary trust' },
  { value: 'Sole Proprietor', label: 'Sole Proprietor', description: 'Individual operating a business' },
  { value: 'Partnership', label: 'Partnership', description: 'Two or more individuals operating jointly' },
  { value: 'Individual', label: 'Individual', description: 'Personal tax assessment client' },
  { value: 'Other', label: 'Other', description: 'NPOs, Co-operatives, or foreign entities' },
];

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ data, onChange, onNext }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onChange({ 
        [name]: checked,
        ...(name === 'sameAsRegistered' && checked ? { postalAddress: data.registeredAddress } : {})
      });
    } else {
      onChange({ [name]: value });
    }
  };

  const handleRegisteredAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange({
      registeredAddress: value,
      ...(data.sameAsRegistered ? { postalAddress: value } : {})
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-slate-50 border border-slate-200 border-l-4 border-slate-800 p-3 rounded-r-md">
        <div className="flex gap-2.5">
          <Sparkles className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Let's Get Started</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Please provide details about your business entity or personal profile. This information is required for statutory registrations and official correspondence.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-4">
        
        {/* Section 1: Entity Profile */}
        <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">1. Entity Structure &amp; Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Entity Type */}
            <div>
              <label htmlFor="entityType" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Entity Type <span className="text-slate-500">*</span>
              </label>
              <select
                id="entityType"
                name="entityType"
                value={data.entityType}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Name */}
            <div>
              <label htmlFor="entityName" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Entity Name / Full Name <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                id="entityName"
                name="entityName"
                placeholder={data.entityType === 'Individual' ? 'John Doe' : 'Trading Name (Pty) Ltd'}
                value={data.entityName}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
            </div>

            {/* Registration Number */}
            {data.entityType !== 'Individual' && (
              <div>
                <label htmlFor="entityRegistrationNumber" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Number <span className="text-slate-400 font-normal text-[9px]">(e.g. 2020/123456/07)</span>
                </label>
                <input
                  type="text"
                  id="entityRegistrationNumber"
                  name="entityRegistrationNumber"
                  placeholder="20XX/XXXXXX/XX"
                  value={data.entityRegistrationNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Contact Representative */}
            <div>
              <label htmlFor="contactName" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Contact Name <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                placeholder="Person to liaise with"
                value={data.contactName}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Tax Registrations */}
        <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">2. Statutory Tax Registrations</h3>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-200/50">
              SARS Reference Fields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Income Tax Number */}
            <div className="relative group">
              <label htmlFor="incomeTaxNumber" className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>Income Tax Number</span>
                <span className="group-hover:text-slate-900 text-slate-400 cursor-help transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="text"
                id="incomeTaxNumber"
                name="incomeTaxNumber"
                placeholder="10-digit tax number"
                value={data.incomeTaxNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
              <p className="absolute hidden group-hover:block bg-slate-950 text-white text-[10px] rounded p-1.5 shadow-md mt-1 w-56 z-20 left-0 leading-normal">
                Your company or personal SARS tax reference number. This is required for annual filing submissions.
              </p>
            </div>

            {/* VAT Number */}
            <div className="relative group">
              <label htmlFor="vatNumber" className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>VAT Number</span>
                <span className="group-hover:text-slate-900 text-slate-400 cursor-help transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="text"
                id="vatNumber"
                name="vatNumber"
                placeholder="4XXXXXXXXX"
                value={data.vatNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
              <p className="absolute hidden group-hover:block bg-slate-950 text-white text-[10px] rounded p-1.5 shadow-md mt-1 w-56 z-20 left-0 leading-normal">
                Required if your taxable turnover exceeds R1 million or if you have registered voluntarily.
              </p>
            </div>

            {/* PAYE Number */}
            <div className="relative group">
              <label htmlFor="payeNumber" className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>PAYE Number</span>
                <span className="group-hover:text-slate-900 text-slate-400 cursor-help transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="text"
                id="payeNumber"
                name="payeNumber"
                placeholder="7XXXXXXXXX"
                value={data.payeNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
              <p className="absolute hidden group-hover:block bg-slate-950 text-white text-[10px] rounded p-1.5 shadow-md mt-1 w-56 z-20 left-0 leading-normal">
                Pay-As-You-Earn reference. Required if employees are liable for income tax deductions.
              </p>
            </div>

            {/* UIF Number */}
            <div className="relative group">
              <label htmlFor="uifNumber" className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>UIF Number</span>
                <span className="group-hover:text-slate-900 text-slate-400 cursor-help transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="text"
                id="uifNumber"
                name="uifNumber"
                placeholder="UXXXXXXXXX"
                value={data.uifNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
              <p className="absolute hidden group-hover:block bg-slate-950 text-white text-[10px] rounded p-1.5 shadow-md mt-1 w-56 z-20 left-0 leading-normal">
                Unemployment Insurance Fund number. Needed if employees work more than 24 hours per month.
              </p>
            </div>

            {/* SDL Number */}
            <div className="relative group">
              <label htmlFor="sdlNumber" className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>SDL Number</span>
                <span className="group-hover:text-slate-900 text-slate-400 cursor-help transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="text"
                id="sdlNumber"
                name="sdlNumber"
                placeholder="LXXXXXXXXX"
                value={data.sdlNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
              <p className="absolute hidden group-hover:block bg-slate-950 text-white text-[10px] rounded p-1.5 shadow-md mt-1 w-56 z-20 left-0 leading-normal">
                Skills Development Levy. Needed if total payroll exceeds R500,000 per annum.
              </p>
            </div>

            {/* Financial Year End */}
            <div>
              <label htmlFor="financialYearEnd" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Financial Year End <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                id="financialYearEnd"
                name="financialYearEnd"
                placeholder="e.g. February, June, December"
                value={data.financialYearEnd}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Communication & Location */}
        <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Mail className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">3. Contact &amp; Correspondence</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Email Address */}
            <div>
              <label htmlFor="emailAddress" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-slate-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  placeholder="name@company.co.za"
                  value={data.emailAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 pl-8 p-2 outline-none transition placeholder:text-slate-400"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Cellphone Number */}
            <div>
              <label htmlFor="cellphoneNumber" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cellphone Number <span className="text-slate-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="cellphoneNumber"
                  name="cellphoneNumber"
                  placeholder="082 123 4567"
                  value={data.cellphoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 pl-8 p-2 outline-none transition placeholder:text-slate-400"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Telephone Number */}
            <div>
              <label htmlFor="telephoneNumber" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Landline Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="telephoneNumber"
                  name="telephoneNumber"
                  placeholder="031 123 4567"
                  value={data.telephoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 pl-8 p-2 outline-none transition placeholder:text-slate-400"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Referred By */}
            <div className="md:col-span-2 lg:col-span-3">
              <label htmlFor="referredBy" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Referred By
              </label>
              <input
                type="text"
                id="referredBy"
                name="referredBy"
                placeholder="How did you hear about Holdstock &amp; Watson?"
                value={data.referredBy}
                onChange={handleInputChange}
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="registeredAddress" className="flex items-center gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Registered Address <span className="text-slate-500">*</span></span>
              </label>
              <textarea
                id="registeredAddress"
                name="registeredAddress"
                rows={2}
                placeholder="Physical address"
                value={data.registeredAddress}
                onChange={handleRegisteredAddressChange}
                required
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-900 text-xs rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 p-2 outline-none transition resize-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="postalAddress" className="flex items-center gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>Postal Address <span className="text-slate-500">*</span></span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="sameAsRegistered"
                    name="sameAsRegistered"
                    checked={data.sameAsRegistered}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-3 w-3"
                  />
                  <label htmlFor="sameAsRegistered" className="text-[10px] text-slate-600 font-bold cursor-pointer select-none">
                    Same as Physical
                  </label>
                </div>
              </div>
              <textarea
                id="postalAddress"
                name="postalAddress"
                rows={2}
                disabled={data.sameAsRegistered}
                placeholder="Postal or P.O. Box address"
                value={data.postalAddress}
                onChange={handleInputChange}
                required
                className={`w-full border text-xs rounded-md p-2 outline-none transition resize-none ${
                  data.sameAsRegistered 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-50/60 border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md hover:bg-slate-800 focus:ring-2 focus:ring-slate-200 transition duration-150 cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>Proceed to Services</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </form>
    </div>
  );
};
