/**
 * Professional Automated Email Templates for PAGASA Guimba Member Portal
 */

export interface CredentialEmailProps {
  recipientName: string;
  recipientEmail: string;
  memberId: string;
  username: string;
  tempPassword?: string;
  loginUrl: string;
  isPasswordReset?: boolean;
}

export function generateCredentialEmailHTML({
  recipientName,
  recipientEmail,
  memberId,
  username,
  tempPassword,
  loginUrl,
  isPasswordReset = false
}: CredentialEmailProps): string {
  const currentYear = 2026;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isPasswordReset ? 'PAGASA Guimba - Password Reset Request' : 'Welcome to PAGASA Guimba - Your Member Portal Credentials'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: #ffffff; padding: 8px 16px; border-radius: 50px; margin-bottom: 16px;">
                <span style="font-size: 13px; font-weight: 800; color: #1d4ed8; letter-spacing: 1px;">🇵🇭 PAGASA GUIMBA YOUTH MIS</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${isPasswordReset ? 'Password Reset Instructions' : 'Welcome to PAGASA Guimba Youth Organization!'}
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #93c5fd; font-weight: 500;">
                ${isPasswordReset ? 'Temporary credentials generated for your account' : 'Official Member Portal Account Activation'}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">
                Mabuhay, <strong>${recipientName}</strong>!
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                ${isPasswordReset 
                  ? 'An administrator has reset your account password as requested. Please find your new temporary credentials below to regain access to your account.'
                  : 'An administrator has approved your membership request and created your official account in the <strong>PAGASA Guimba Youth Management Information System (MIS)</strong>. You can now access official events, attendance tracking, e-certificates, and your digital QR ID pass.'
                }
              </p>

              <!-- Credentials Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      🔑 YOUR MEMBER PORTAL LOGIN CREDENTIALS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6">
                      <tr>
                        <td width="38%" style="font-size: 13px; color: #64748b; font-weight: 600;">Member ID:</td>
                        <td width="62%" style="font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 700;">${memberId}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; font-weight: 600;">Registered Email:</td>
                        <td style="font-size: 14px; color: #0f172a; font-weight: 600;">${recipientEmail}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #1d4ed8; font-weight: 700;">Assigned Username:</td>
                        <td style="font-size: 15px; color: #1d4ed8; font-weight: 800; font-family: monospace; background-color: #dbeafe; padding: 4px 8px; border-radius: 6px; display: inline-block;">${username}</td>
                      </tr>
                      ${tempPassword ? `
                      <tr>
                        <td style="font-size: 13px; color: #dc2626; font-weight: 700;">Temporary Password:</td>
                        <td style="font-size: 15px; color: #991b1b; font-weight: 800; font-family: monospace; background-color: #fee2e2; padding: 4px 8px; border-radius: 6px; display: inline-block;">${tempPassword}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #1d4ed8; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.35);">
                      🚀 Log In to Member Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Instructions Notice -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-left: 4px solid #1d4ed8; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #1e3a8a;">
                      ⚠️ Next Steps for First-Time Login:
                    </p>
                    <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #1e40af; line-height: 1.6;">
                      <li>Click the button above or navigate to <strong>${loginUrl}</strong>.</li>
                      <li>Select <strong>Member Sign In</strong> and enter your <strong>Username</strong> (${username}) and <strong>Temporary Password</strong>.</li>
                      <li>Upon your first successful login, you will be prompted to create your permanent, personal password.</li>
                      <li>Never share your credentials with anyone.</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #64748b;">
                If you have questions or difficulty accessing your portal, please reach out to the <strong>PAGASA Guimba Youth Leadership Board</strong> at <a href="mailto:admin@pagasaguimba.org" style="color: #1d4ed8; text-decoration: none;">admin@pagasaguimba.org</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #475569;">
                PAGASA Guimba Youth Organization • Municipality of Guimba, Nueva Ecija
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                This is an automated administrative notification. © ${currentYear} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateCredentialEmailPlainText({
  recipientName,
  recipientEmail,
  memberId,
  username,
  tempPassword,
  loginUrl,
  isPasswordReset = false
}: CredentialEmailProps): string {
  return `🇵🇭 PAGASA GUIMBA YOUTH MIS - MEMBER PORTAL CREDENTIALS

Mabuhay, ${recipientName}!

${isPasswordReset 
  ? 'An administrator has reset your account credentials as requested.'
  : 'Your official youth membership has been approved and your Member Portal credentials are ready.'}

--------------------------------------------------
YOUR LOGIN CREDENTIALS:
--------------------------------------------------
👤 Member ID: ${memberId}
📧 Registered Email: ${recipientEmail}
🔑 Assigned Username: ${username}
🔒 Temporary Password: ${tempPassword || '(Use previously assigned password)'}
🔗 Login Portal URL: ${loginUrl}
--------------------------------------------------

INSTRUCTIONS:
1. Go to ${loginUrl} and click Member Sign In.
2. Log in using your Assigned Username and Temporary Password.
3. You will be required to change your temporary password upon your first successful login.

If you have any questions, contact admin@pagasaguimba.org.

Municipality of Guimba, Nueva Ecija • PAGASA Guimba Youth MIS`;
}
