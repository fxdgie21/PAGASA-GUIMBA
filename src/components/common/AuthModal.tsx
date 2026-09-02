import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { PagasaLogo } from './PagasaLogo';
import { X, Lock, Mail, User, Phone, Calendar, Shield, ArrowRight, CheckCircle2, Loader2, Sparkles, KeyRound, Check, HelpCircle, Eye, EyeOff, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithSupabase,
    signUpWithSupabase,
    resetUserPassword,
    loginWithGoogle,
    members,
    switchRole
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginFullName, setLoginFullName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('2004-01-01');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Prefer not to say' | 'Other'>('Male');
  const [regAddress, setRegAddress] = useState('');
  const [regBarangay, setRegBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [regEducation, setRegEducation] = useState<'High School' | 'Senior High' | 'College / University' | 'Vocational / TVET' | 'Out of School Youth' | 'Employed Professional' | 'Other'>('College / University');
  const [regOccupation, setRegOccupation] = useState('');
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyRel, setRegEmergencyRel] = useState('Parent');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [regSuccessMemberId, setRegSuccessMemberId] = useState<string | null>(null);
  const [regSuccessEmail, setRegSuccessEmail] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        setIsAuthModalOpen(false);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginEmail.trim();
    const password = loginPassword.trim();

    if (!identifier) return;

    setIsSubmitting(true);
    try {
      const targetRole = authModalMode === 'admin-login' ? 'SUPER_ADMIN' : 'MEMBER';
      const res = await loginWithSupabase(identifier, password, targetRole, loginFullName);
      if (res.success) {
        setIsAuthModalOpen(false);
        setLoginPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regContact.trim()) return;

    setIsSubmitting(true);
    try {
      const birthYear = new Date(regBirthdate).getFullYear();
      const currentYear = 2026;
      const calculatedAge = Math.max(15, currentYear - birthYear);
      const cleanEmail = regEmail.trim().toLowerCase();

      const res = await signUpWithSupabase(cleanEmail, '', {
        fullName: regFullName.trim(),
        email: cleanEmail,
        contactNumber: regContact,
        birthdate: regBirthdate,
        age: calculatedAge,
        gender: regGender,
        address: regAddress || `Purok 1, Brgy. ${regBarangay}, Guimba`,
        barangay: regBarangay,
        educationalStatus: regEducation,
        occupation: regOccupation || 'Youth Member / Student',
        profilePicture: regGender === 'Female' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        membershipStatus: 'Active',
        organizationPosition: 'Youth Member',
        committee: 'General Youth Volunteer',
        gmailAccessEnabled: true,
        emergencyContact: {
          name: regEmergencyName || 'Family Contact',
          relationship: regEmergencyRel || 'Parent / Guardian',
          contactNumber: regEmergencyContact || regContact
        }
      });

      setRegSuccessEmail(cleanEmail);
      if (res.memberId) {
        setRegSuccessMemberId(res.memberId);
      } else {
        setRegSuccessMemberId(`PAGASA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      }

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotStatus('loading');
    try {
      await resetUserPassword(forgotEmail);
      setForgotStatus('success');
    } catch {
      setForgotStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-6 text-white relative">
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setRegSuccessMemberId(null);
              setShowForgotModal(false);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <PagasaLogo size={46} showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  PAGASA Guimba MIS
                </span>
                <span className="text-[10px] bg-sky-400/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Official Portal
                </span>
              </div>
              <h2 className="text-xl font-display font-bold">
                {showForgotModal ? 'Need Sign-In Help' :
                  regSuccessMemberId ? 'Registration Complete!' : 
                  authModalMode === 'admin-login' ? 'Administrator Sign In' :
                  authModalMode === 'login' ? 'Member Portal Sign In' : 'Join Organization'}
              </h2>
            </div>
          </div>
        </div>

        {/* Help / Password Recovery View */}
        {showForgotModal ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Member Sign-In Assistance</span>
            </div>
            {forgotStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Access Information Dispatched</h4>
                <p className="text-xs text-slate-600">
                  We've sent access instructions to <strong>{forgotEmail}</strong>. You can sign in using your Gmail username or 1-click Google OAuth.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus('idle');
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered account Gmail and our system will verify your membership and resend access details.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={forgotStatus === 'loading'}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Verify & Resend Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : regSuccessMemberId ? (
          /* Success Screen after registration */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Registration Complete & Account Activated!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Mabuhay! You have officially joined PAGASA Guimba. Your assigned Member ID is:
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl inline-block font-mono font-bold text-blue-800 text-lg">
              {regSuccessMemberId}
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-left max-w-md mx-auto space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Automated Email Notification Dispatched</span>
              </div>
              <p className="text-slate-600">
                An automated welcome notification has been sent to <strong>{regSuccessEmail}</strong>. Your Gmail is authorized for password-free access.
              </p>
            </div>
            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={() => {
                  const targetInput = regSuccessEmail.split('@')[0] || regSuccessEmail;
                  loginWithSupabase(targetInput, '', 'MEMBER');
                  setIsAuthModalOpen(false);
                  setRegSuccessMemberId(null);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Enter Member Portal Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setRegSuccessMemberId(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                onClick={() => setAuthModalMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Member Portal
              </button>
              <button
                onClick={() => setAuthModalMode('admin-login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'admin-login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Portal
              </button>
              <button
                onClick={() => setAuthModalMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Join Organization
              </button>
            </div>

            {/* Login Form (Member or Admin) */}
            {(authModalMode === 'login' || authModalMode === 'admin-login') && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Admin Master Credentials Banner */}
                {authModalMode === 'admin-login' ? (
                  <div className="p-3.5 bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/60 rounded-2xl text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-sky-200">Admin Master Credentials</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('PAGASA_ADMIN');
                          setLoginPassword('TayoAngPagasa2026');
                        }}
                        className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Autofill Admin</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Username:</span>
                        <strong className="text-sky-300 select-all">PAGASA_ADMIN</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Password:</span>
                        <strong className="text-emerald-300 select-all">TayoAngPagasa2026</strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Restricted to authorized organization administrators and MIS managers.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Password-Free Member Login</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Gmail Username Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Simply enter your registered Gmail address, Gmail username (e.g. <code>giancarlomagat19</code>), or 1-click Google sign in. No password required.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold">Quick Sign In:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('giancarlomagat19');
                          loginWithSupabase('giancarlomagat19', '', 'MEMBER');
                          setIsAuthModalOpen(false);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        Gian Carlo Magat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('fxdgie21');
                          loginWithSupabase('fxdgie21', '', 'MEMBER');
                          setIsAuthModalOpen(false);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        Gian Magat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('juan.delacruz');
                          loginWithSupabase('juan.delacruz', '', 'MEMBER');
                          setIsAuthModalOpen(false);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        Juan Dela Cruz
                      </button>
                    </div>
                  </div>
                )}

                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Verifying Authorized Gmail...' : authModalMode === 'admin-login' ? 'Admin Sign In with Google' : 'Continue with Authorized Gmail'}</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                      {authModalMode === 'admin-login' ? 'Or enter Admin Credentials' : 'Or enter Gmail Username'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {authModalMode === 'admin-login' ? 'Admin Username or Email' : 'Authorized Gmail or Gmail Username'}
                  </label>
                  <div className="relative">
                    {authModalMode === 'admin-login' ? (
                      <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={authModalMode === 'admin-login' ? 'PAGASA_ADMIN' : 'e.g. giancarlomagat19 or juan.delacruz@gmail.com'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password only for Admin */}
                {authModalMode === 'admin-login' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Admin Master Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="TayoAngPagasa2026"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Remember me on this device
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setShowForgotModal(true);
                    }}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Need assistance?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{authModalMode === 'admin-login' ? 'Sign In to Admin MIS Portal' : 'Sign In to Member Portal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Registration Form (Join Organization) */}
            {authModalMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
                {/* Instant Gmail Authorization Callout */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Automatic Gmail Authorization (No Password Needed)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Submit your details below. The system automatically registers and emails your account confirmation. You will log in simply by typing your Gmail username.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gmail Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="juan.delacruz@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile / Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={regContact}
                        onChange={(e) => setRegContact(e.target.value)}
                        placeholder="0917-000-0000"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Barangay (Guimba) *
                    </label>
                    <select
                      value={regBarangay}
                      onChange={(e) => setRegBarangay(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {GUIMBA_BARANGAYS.map((b) => (
                        <option key={b} value={b}>Brgy. {b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Birthdate *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={regBirthdate}
                        onChange={(e) => setRegBirthdate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Educational / Youth Status
                  </label>
                  <select
                    value={regEducation}
                    onChange={(e) => setRegEducation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="College / University">College / University</option>
                    <option value="Senior High">Senior High</option>
                    <option value="High School">High School</option>
                    <option value="Vocational / TVET">Vocational / TVET</option>
                    <option value="Employed Professional">Employed Professional</option>
                    <option value="Out of School Youth">Out of School Youth</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / Purok
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Purok / Zone, Sitio, Landmark"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Emergency Contact Person
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={regEmergencyName}
                      onChange={(e) => setRegEmergencyName(e.target.value)}
                      placeholder="Contact Name"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={regEmergencyRel}
                      onChange={(e) => setRegEmergencyRel(e.target.value)}
                      placeholder="Relationship (e.g. Mother)"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="tel"
                      value={regEmergencyContact}
                      onChange={(e) => setRegEmergencyContact(e.target.value)}
                      placeholder="Emergency Phone"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  By clicking Register, your membership is created and an automated welcome email with your portal access will be sent.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Join Organization & Activate Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

