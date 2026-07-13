export type EntityType = 
  | 'Company' 
  | 'Close Corporation' 
  | 'Trust' 
  | 'Sole Proprietor' 
  | 'Partnership' 
  | 'Individual' 
  | 'Other';

export interface ClientInformation {
  entityType: EntityType;
  entityName: string;
  entityRegistrationNumber: string;
  contactName: string;
  incomeTaxNumber: string;
  vatNumber: string;
  cellphoneNumber: string;
  payeNumber: string;
  uifNumber: string;
  telephoneNumber: string;
  sdlNumber: string;
  referredBy: string;
  emailAddress: string;
  registeredAddress: string;
  postalAddress: string;
  financialYearEnd: string;
  sameAsRegistered: boolean;
}

export type BeneficialOwnerType = 'Individual' | 'NonResident' | 'Company';

export interface IndividualOwner {
  id: string;
  type: 'Individual';
  fullName: string;
  idNumber: string;
  email: string;
  cell: string;
}

export interface NonResidentOwner {
  id: string;
  type: 'NonResident';
  fullName: string;
  email: string;
  cell: string;
  passportNumber: string;
  passportDateOfIssue: string;
  passportCountryOfOrigin: string;
  taxReferenceNumber: string;
  noTaxReason?: string;
}

export interface CompanyOwner {
  id: string;
  type: 'Company';
  companyName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  cell: string;
}

export type BeneficialOwner = IndividualOwner | NonResidentOwner | CompanyOwner;

export interface RequiredServices {
  annualTaxReturns: boolean;
  irp6Returns: boolean;
  vat201Returns: boolean;
  annualAudit: boolean;
  annualFinancialStatements: boolean;
  managementAccounts: boolean;
  workmensCompReg: boolean;
  payrollService: boolean;
  monthlyBooks: boolean;
  emp201Returns: boolean;
  emp501Returns: boolean;
  cipcAnnualReturns: boolean;
  monthlyRetainer: 'YES' | 'NO';
}

export interface OnboardingFormState {
  clientInfo: ClientInformation;
  beneficialOwners: BeneficialOwner[];
  services: RequiredServices;
  signatures: {
    clientName: string;
    date: string;
    acknowledgedTerms: boolean;
  };
}
