import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { PagasaLogo } from './PagasaLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { X, Lock, Mail, User, Phone, Calendar, Shield, ArrowRight, CheckCircle2, Loader2, Sparkles, KeyRound, Eye, EyeOff, Send, Clock, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithSupabase,
    addMember,
    members
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regBarangay, setRegBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [regSuccessMemberId, setRegSuccessMemberId] = useState<string | null>(null);
  const [regSuccessEmail, setRegSuccessEmail] = useState<string>('');
  const [regSuccessName, setRegSuccessName] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginEmail.trim();
    const password = loginPassword.trim();

    if (!identifier) return;

    setIsSubmitting(true);
    try {
      const targetRole = authModalMode === 'admin-login' ? 'SUPER_ADMIN' : 'MEMBER';
      const res = await loginWithSupabase(identifier, password, targetRole);
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
    if (!regEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const cleanName = regFullName.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const newMember = addMember({
        fullName: cleanName,
        email: cleanEmail,
        contactNumber: regContact.trim() || '0900-000-0000',
        birthdate: '2004-01-01',
        age: 22,
        gender: 'Prefer not to say',
        address: `Brgy. ${regBarangay}, Guimba, Nueva Ecija`,
        barangay: regBarangay,
        educationalStatus: 'College / University',
        occupation: 'Youth Member / Volunteer',
        membershipStatus: 'Pending Credentials',
        credentialStatus: 'Credentials Not Assigned',
        organizationPosition: 'Youth Member',
        committee: 'General Youth Volunteer',
        gmailAccessEnabled: true,
        emergencyContact: {
          name: 'Primary Family Contact',
          relationship: 'Parent / Guardian',
          contactNumber: regContact.trim() || '0900-000-0000'
        }
      });

      setRegSuccessEmail(cleanEmail);
      setRegSuccessName(cleanName);
      setRegSuccessMemberId(newMember.memberId);

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                  {regSuccessMemberId ? 'Registration Received!' : 
                    authModalMode === 'admin-login' ? 'Administrator Sign In' :
                    authModalMode === 'login' ? 'Member Portal Sign In' : 'Join PAGASA Guimba'}
                </h2>
              </div>
            </div>
          </div>

          {regSuccessMemberId ? (
            /* Success Screen after registration: Pending Credentials */
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Registration Submitted Successfully!</h3>
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block border border-amber-200">
                  Status: Pending Credentials
                </p>
              </div>

              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{regSuccessName}</strong>! Your registration request has been submitted to the organization administrators.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block font-mono text-slate-700 text-xs text-left w-full max-w-md space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Member ID:</span>
                  <span className="font-bold text-blue-900">{regSuccessMemberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Gmail:</span>
                  <span className="font-bold text-slate-800">{regSuccessEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Access Status:</span>
                  <span className="font-bold text-amber-600">Pending Admin Credential Assignment</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-left max-w-md mx-auto space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Next Step: What Happens Now?</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  An administrator will review your registration, assign your unique <strong>Username</strong>, and generate a <strong>Temporary Password</strong>. You will receive an automated email at <strong>{regSuccessEmail}</strong> containing your login credentials once approved.
                </p>
              </div>

              <div className="pt-3 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setRegSuccessMemberId(null);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
                >
                  Understood & Close
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
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                          <span>Member Portal Authentication</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                          Username & Password
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Sign in with the <strong>Username</strong> and <strong>Temporary Password</strong> dispatched to your registered Gmail address.
                      </p>

                      {/* Demo credential helpers if any member has credentials */}
                      {members.filter(m => m.username && m.tempPassword).length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-semibold">Quick Test Accounts:</span>
                          {members.filter(m => m.username && m.tempPassword).slice(0, 3).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setLoginEmail(m.username || m.email);
                                setLoginPassword(m.tempPassword || '');
                              }}
                              className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                              title={`Fill credentials for ${m.fullName}`}
                            >
                              {m.fullName.split(' ')[0]} ({m.username})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {authModalMode === 'admin-login' ? 'Admin Username' : 'Assigned Username or Gmail Address'}
                    </label>
                    <div className="relative">
                      {authModalMode === 'admin-login' ? (
                        <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      )}
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={authModalMode === 'admin-login' ? 'PAGASA_ADMIN' : 'e.g. jdelacruz or juan.delacruz@gmail.com'}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        {authModalMode === 'admin-login' ? 'Admin Master Password' : 'Password / Temporary Key'}
                      </label>
                      {authModalMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={authModalMode === 'admin-login' ? 'TayoAngPagasa2026' : 'Enter temporary or permanent password'}
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
                      onClick={() => setAuthModalMode('register')}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Not yet registered?
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

              {/* Registration Form (Join Organization - Simple email entry as requested) */}
              {authModalMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span>Simple Member Registration</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Simply enter your Gmail address and name below. <strong>You do not need to create a username or password.</strong> An administrator will assign your credentials and email your temporary access password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gmail / Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="your.name@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Your temporary login credentials will be emailed to this address.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Barangay (Guimba)
                      </label>
                      <select
                        value={regBarangay}
                        onChange={(e) => setRegBarangay(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {GUIMBA_BARANGAYS.map((b) => (
                          <option key={b} value={b}>Brgy. {b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={regContact}
                          onChange={(e) => setRegContact(e.target.value)}
                          placeholder="0917-000-0000"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold block mb-0.5">🔒 Admin-Controlled Credential Assignment</span>
                    Your account will be created with status <strong>Pending Credentials</strong>. The administrator will assign your username and securely dispatch your temporary password to your email.
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
                        <span>Submit Registration & Request Access</span>
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
};

