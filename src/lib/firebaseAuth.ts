import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OnboardingFormState } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear token if user is signed in but we don't have a cached token
        // This triggers a fresh sign-in to ensure we get the Gmail send scope
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Clear session
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// UTF-8 safe Base64 encoder
const safeBtoa = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

// Helper to format HTML email content
export const generateEmailHtml = (state: OnboardingFormState, referenceNo: string): string => {
  const { clientInfo, beneficialOwners, services } = state;

  const getActiveServices = () => {
    const list: string[] = [];
    if (services.annualTaxReturns) list.push('Annual Income Tax Returns (IT14)');
    if (services.irp6Returns) list.push('Provisional Tax Returns (IRP6)');
    if (services.vat201Returns) list.push('Value Added Tax Returns (VAT201)');
    if (services.annualAudit) list.push('Annual Statutory Audit');
    if (services.annualFinancialStatements) list.push('Preparation of Annual Financial Statements');
    if (services.managementAccounts) list.push('Monthly / Quarterly Management Accounts');
    if (services.workmensCompReg) list.push("COIDA / Workmen's Compensation Registration & Returns");
    if (services.payrollService) list.push('Full Monthly Payroll & Payslip Administration');
    if (services.monthlyBooks) list.push('Monthly Bookkeeping & Reconciliation');
    if (services.emp201Returns) list.push('Monthly PAYE/UIF/SDL Returns (EMP201)');
    if (services.emp501Returns) list.push('Bi-Annual Employer Reconciliation (EMP501)');
    if (services.cipcAnnualReturns) list.push('CIPC Annual Return Filing & Secretarial Maintenance');
    return list;
  };

  const selectedServices = getActiveServices();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Holdstock & Watson Client Onboarding Profile</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background-color: #0f172a; padding: 25px; border-bottom: 3px solid #10b981; }
        .header-title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
        .header-subtitle { font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 1.5px; }
        .content { padding: 30px; }
        .welcome { font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 25px; }
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-left: 3px solid #10b981; padding-left: 8px; margin: 25px 0 12px 0; letter-spacing: 0.5px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        .data-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .data-table td.label { width: 35%; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        .data-table td.value { color: #0f172a; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; border-radius: 4px; }
        .badge-green { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .badge-blue { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
        .badge-purple { background-color: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }
        .badge-dark { background-color: #1e293b; color: #ffffff; }
        .ref-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0; }
        .ref-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; margin-bottom: 5px; }
        .ref-code { font-family: monospace; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: 1.5px; }
        .owner-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 10px; font-size: 12px; }
        .owner-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 8px; }
        .owner-name { font-weight: bold; color: #0f172a; margin: 0; }
        .footer { background-color: #f1f5f9; padding: 20px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer-logo { font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p class="header-subtitle">Official Client Intake Submission</p>
          <h1 class="header-title">Holdstock & Watson Inc</h1>
        </div>
        
        <div class="content">
          <p class="welcome">
            Thank you for completing the client onboarding profile. A digital transcript of your submitted details has been compiled below for your records and compliance files.
          </p>

          <div class="ref-box">
            <span class="ref-label">Your Intake Reference Number</span>
            <span class="ref-code">${referenceNo}</span>
          </div>

          <div class="section-title">1. Entity Structure & Contacts</div>
          <table class="data-table">
            <tr>
              <td class="label">Entity Type</td>
              <td class="value">${clientInfo.entityType || '—'}</td>
            </tr>
            <tr>
              <td class="label">Registered Name</td>
              <td class="value">${clientInfo.entityName || '—'}</td>
            </tr>
            <tr>
              <td class="label">Registration No</td>
              <td class="value">${clientInfo.entityRegistrationNumber || '—'}</td>
            </tr>
            <tr>
              <td class="label">Primary Contact</td>
              <td class="value">${clientInfo.contactName || '—'}</td>
            </tr>
            <tr>
              <td class="label">Cellphone No</td>
              <td class="value">${clientInfo.cellphoneNumber || '—'}</td>
            </tr>
            <tr>
              <td class="label">Email Address</td>
              <td class="value">${clientInfo.emailAddress || '—'}</td>
            </tr>
            <tr>
              <td class="label">Landline No</td>
              <td class="value">${clientInfo.telephoneNumber || '—'}</td>
            </tr>
            <tr>
              <td class="label">Financial Year End</td>
              <td class="value">${clientInfo.financialYearEnd || '—'}</td>
            </tr>
            <tr>
              <td class="label">Physical Address</td>
              <td class="value" style="white-space: pre-wrap; font-weight: normal;">${clientInfo.registeredAddress || '—'}</td>
            </tr>
            <tr>
              <td class="label">Postal Address</td>
              <td class="value" style="white-space: pre-wrap; font-weight: normal;">
                ${clientInfo.sameAsRegistered ? 'Same as Physical Address' : clientInfo.postalAddress || '—'}
              </td>
            </tr>
          </table>

          <div class="section-title">2. Statutory Tax Registrations</div>
          <table class="data-table">
            <tr>
              <td class="label">Income Tax Number</td>
              <td class="value" style="font-family: monospace;">${clientInfo.incomeTaxNumber || 'Not Registered'}</td>
            </tr>
            <tr>
              <td class="label">VAT Number</td>
              <td class="value" style="font-family: monospace;">${clientInfo.vatNumber || 'Not Registered'}</td>
            </tr>
            <tr>
              <td class="label">PAYE Number</td>
              <td class="value" style="font-family: monospace;">${clientInfo.payeNumber || 'Not Registered'}</td>
            </tr>
            <tr>
              <td class="label">UIF Number</td>
              <td class="value" style="font-family: monospace;">${clientInfo.uifNumber || 'Not Registered'}</td>
            </tr>
            <tr>
              <td class="label">SDL Number</td>
              <td class="value" style="font-family: monospace;">${clientInfo.sdlNumber || 'Not Registered'}</td>
            </tr>
          </table>

          <div class="section-title">3. Selected Financial Services</div>
          ${selectedServices.length === 0 ? '<p style="font-size: 13px; color: #64748b; font-style: italic;">No specific compliance services selected.</p>' : `
            <ul style="font-size: 13px; color: #0f172a; padding-left: 20px; font-weight: bold; margin-bottom: 15px;">
              ${selectedServices.map(s => `<li style="margin-bottom: 5px;">${s}</li>`).join('')}
            </ul>
          `}
          
          <table class="data-table">
            <tr>
              <td class="label">Monthly Retainer Request</td>
              <td class="value"><span class="badge badge-dark">${services.monthlyRetainer}</span></td>
            </tr>
          </table>

          <div class="section-title">4. Beneficial Ownership Register</div>
          ${beneficialOwners.length === 0 ? '<p style="font-size: 12px; color: #ef4444; font-style: italic;">No Beneficial Owners declared.</p>' : `
            <div>
              ${beneficialOwners.map(owner => {
                const isInd = owner.type === 'Individual';
                const isNonRes = owner.type === 'NonResident';
                const isComp = owner.type === 'Company';
                return `
                  <div class="owner-card">
                    <div class="owner-header">
                      <span class="owner-name">${isComp ? owner.companyName : owner.fullName}</span>
                      <span class="badge ${isInd ? 'badge-green' : isNonRes ? 'badge-blue' : 'badge-purple'}">
                        ${isInd ? 'SA Citizen' : isNonRes ? 'Foreign National' : 'Corporate Holdco'}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-bottom: 5px;">
                      ${isInd ? `<strong>ID Number:</strong> ${owner.idNumber}` : ''}
                      ${isNonRes ? `<strong>Passport No:</strong> ${owner.passportNumber} (${owner.passportCountryOfOrigin})<br/><strong>Tax Ref No:</strong> ${owner.taxReferenceNumber || 'N/A'}${owner.taxReferenceNumber === 'N/A' ? `<br/><strong>Reason:</strong> ${owner.noTaxReason}` : ''}` : ''}
                      ${isComp ? `<strong>Reg No:</strong> ${owner.registrationNumber}<br/><strong>Representative:</strong> ${owner.contactName}` : ''}
                    </div>
                    <div style="font-size: 11px; color: #475569;">
                      <strong>Email:</strong> ${owner.email} | <strong>Cell:</strong> ${owner.cell}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

          <div class="section-title">5. Sign-Off & Verification</div>
          <table class="data-table">
            <tr>
              <td class="label">Electronic Stamp</td>
              <td class="value" style="font-family: serif; font-style: italic; font-size: 18px; color: #0f172a; border: 1px dashed #cbd5e1; padding: 10px; border-radius: 4px; background: #f8fafc; text-align: center;">
                ${state.signatures.clientName || 'Digitally Signed'}
              </td>
            </tr>
            <tr>
              <td class="label">Date Signed</td>
              <td class="value">${state.signatures.date || new Date().toLocaleDateString('en-ZA')}</td>
            </tr>
            <tr>
              <td class="label">Status</td>
              <td class="value" style="color: #059669;">Dossier Verified & Transmitted</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <div class="footer-logo">Holdstock & Watson Inc</div>
          <p style="margin: 0 0 5px 0;">Chartered Accountants (SA) & Registered Auditors</p>
          <p style="margin: 0;">11 Holden Avenue, Windermere, Durban, South Africa</p>
          <p style="margin: 5px 0 0 0; font-size: 9px; color: #94a3b8;">© ${new Date().getFullYear()} Holdstock & Watson Incorporated. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email using Google Workspace Gmail API
export const sendOnboardingEmail = async (
  token: string,
  state: OnboardingFormState,
  referenceNo: string
): Promise<boolean> => {
  try {
    const clientEmail = state.clientInfo.emailAddress;
    const practiceEmail = 'onboarding@holdstock.co.za';
    
    const subject = `Holdstock & Watson Client Onboarding [REF: ${referenceNo}] - ${state.clientInfo.entityName || 'Dossier'}`;
    const htmlBody = generateEmailHtml(state, referenceNo);

    const emailParts = [
      `To: ${clientEmail}`,
      `Cc: ${practiceEmail}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="utf-8"',
      'Content-Transfer-Encoding: base64',
      '',
      safeBtoa(htmlBody)
    ];

    const emailStr = emailParts.join('\r\n');
    const raw = safeBtoa(emailStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gmail API Error Response:', errorData);
      throw new Error(`Gmail API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Onboarding email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('sendOnboardingEmail Error:', err);
    throw err;
  }
};
