import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  X, 
  Key, 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
  Clock
} from 'lucide-react';
import { generateSecureTempPassword, generateDefaultUsername } from '../../utils/crypto';
import { generateCredentialEmailHTML } from '../../utils/emailTemplates';

interface ManageCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess?: () => void;
}

export const ManageCredentialsModal: React.FC<ManageCredentialsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess
}) => {
  const { 
    assignMemberCredentials, 
    resendCredentialsEmail, 
    resetMemberPassword,
    toggleMemberPortalAccess,
    showToast 
  } = useApp();

  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (member) {
      const defaultUser = member.username || generateDefaultUsername(member.email, member.fullName);
      setUsername(defaultUser);
      
      const newTemp = member.tempPassword || generateSecureTempPassword();
      setTempPassword(newTemp);
      
      setSendEmail(true);
      setMustChangePassword(member.mustChangePassword !== false);
      setShowEmailPreview(false);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleGeneratePassword = () => {
    const fresh = generateSecureTempPassword();
    setTempPassword(fresh);
    showToast('info', 'New Password Generated', `Generated temporary key: ${fresh}`);
  };

  const handleGenerateUsername = () => {
    const fresh = generateDefaultUsername(member.email, member.fullName);
    setUsername(fresh);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast('info', 'Copied to Clipboard', `${label} copied successfully.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('error', 'Username Required', 'Please assign a username for the member.');
      return;
    }
    if (!tempPassword.trim()) {
      showToast('error', 'Password Required', 'Please provide or generate a temporary password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await assignMemberCredentials(
        member.id,
        username.trim().toLowerCase(),
        tempPassword.trim(),
        sendEmail
      );
      if (res.success) {
        showToast('success', 'Credentials Assigned', res.message);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast('error', 'Failed to Assign', res.message);
      }
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to assign credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const res = await resendCredentialsEmail(member.id);
      if (res.success) {
        showToast('success', 'Email Resent', res.message);
      } else {
        showToast('error', 'Resend Failed', res.message);
      }
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to resend credentials email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleQuickResetPassword = async () => {
    const generated = generateSecureTempPassword();
    setTempPassword(generated);
    try {
      const res = await resetMemberPassword(member.id, generated);
      if (res.success) {
        showToast('success', 'Password Reset', `New password generated: ${generated}. Reset email dispatched.`);
      }
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to reset password.');
    }
  };

  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://pagasaguimba.org';
  const previewHtml = generateCredentialEmailHTML({
    recipientName: member.fullName,
    recipientEmail: member.email,
    memberId: member.memberId,
    username: username || 'username',
    tempPassword: tempPassword,
    loginUrl
  });

  const isCredentialsSent = member.credentialStatus === 'Credentials Sent';
  const isPending = member.membershipStatus === 'Pending Credentials' || member.credentialStatus === 'Credentials Not Assigned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Manage Portal Credentials</h2>
              <p className="text-xs text-blue-200">Assign username, temporary password, & automated email dispatch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={member.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(member.fullName)}`}
              alt={member.fullName}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{member.fullName}</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                  {member.memberId}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{member.email}</span>
                <span className="text-slate-300">•</span>
                <span>Brgy. {member.barangay}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPending ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Pending Credentials
              </span>
            ) : isCredentialsSent ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Credentials Sent
              </span>
            ) : (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                {member.credentialStatus || 'Active'}
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveCredentials} className="p-6 space-y-5">
          {/* Status & History Banner */}
          {member.credentialsAssignedAt && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  Credentials assigned on <strong>{new Date(member.credentialsAssignedAt).toLocaleDateString()}</strong>
                  {member.credentialsEmailSentAt && ` • Email dispatched ${new Date(member.credentialsEmailSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending...' : 'Resend Email'}</span>
              </button>
            </div>
          )}

          {/* Section 1: Assigned Username */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Username</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateUsername}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Auto-Suggest
                </button>
                {username && (
                  <button
                    type="button"
                    onClick={() => handleCopy(username, 'Username')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'Username' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Username' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="e.g. juan.delacruz or juandc21"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              The member will use this username (or their registered Gmail) to sign in to the portal.
            </p>
          </div>

          {/* Section 2: Temporary Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Temporary Password</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Generate Strong Key</span>
                </button>
                {tempPassword && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tempPassword, 'Temporary Password')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'Temporary Password' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Temporary Password' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="e.g. Pagasa-9X4K-2026"
                required
                className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Never stored in plain text. Stored securely as an encrypted salted SHA-256 hash upon saving.
            </p>
          </div>

          {/* Section 3: Dispatch & Security Toggles */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatically dispatch credential email to registered Gmail</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sends welcome greeting, assigned username, temporary password, and portal link to <code className="text-slate-700 font-semibold">{member.email}</code>.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200/60 pt-2.5">
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enforce mandatory password change on first login</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The member will be prompted to create their permanent secret password upon their first sign-in.
                </p>
              </div>
            </label>
          </div>

          {/* Section 4: Email Preview Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Preview Automated Credential Email</span>
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[11px] font-normal">{showEmailPreview ? 'Hide' : 'Show Live Preview'}</span>
                {showEmailPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showEmailPreview && (
              <div className="p-4 bg-slate-100 border-t border-slate-200 max-h-72 overflow-y-auto">
                <div 
                  className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>

          {/* Portal Access Revoke / Disable Option */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Member Portal Access Status:</span>
            <button
              type="button"
              onClick={() => {
                const newDisabled = !member.isPortalAccessDisabled;
                toggleMemberPortalAccess(member.id, newDisabled);
                showToast(
                  newDisabled ? 'warning' : 'success',
                  newDisabled ? 'Portal Access Revoked' : 'Portal Access Restored',
                  `Member portal access for ${member.fullName} is now ${newDisabled ? 'Disabled' : 'Active'}.`
                );
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                member.isPortalAccessDisabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              {member.isPortalAccessDisabled ? 'Re-enable Portal Access' : 'Disable Portal Access'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Credentials...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{sendEmail ? 'Save & Dispatch Credentials' : 'Save Credentials Only'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
