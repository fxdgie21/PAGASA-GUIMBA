import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, User } from '../../types';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  QrCode, 
  Filter, 
  X, 
  Check, 
  Eye,
  EyeOff,
  Shield,
  FileSpreadsheet,
  Camera,
  Mail,
  Copy,
  LogIn,
  Sparkles,
  UserCheck,
  ExternalLink,
  Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ChangeProfilePictureModal } from '../common/ChangeProfilePictureModal';

export const AdminMembers: React.FC = () => {
  const { 
    members, 
    addMember, 
    updateMember, 
    deleteMember, 
    selectedMemberId, 
    setSelectedMemberId,
    switchRole,
    setCurrentPage,
    addToast,
    confirmAction
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [onlyGmailAccess, setOnlyGmailAccess] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [photoTargetMember, setPhotoTargetMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(
    selectedMemberId ? members.find(m => m.id === selectedMemberId) || null : null
  );

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formBarangay, setFormBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [formBirthdate, setFormBirthdate] = useState('2004-01-01');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Prefer not to say' | 'Other'>('Male');
  const [formEducation, setFormEducation] = useState<any>('College / University');
  const [formStatus, setFormStatus] = useState<'Active' | 'Pending' | 'Inactive'>('Active');
  const [formPosition, setFormPosition] = useState('Youth Member');
  const [formCommittee, setFormCommittee] = useState('General Youth Volunteer');
  const [formAddress, setFormAddress] = useState('');
  const [formGmailAccess, setFormGmailAccess] = useState(true);
  const [formPortalPassword, setFormPortalPassword] = useState('PagasaMember2026');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = 'Pagasa';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '2026';
    setFormPortalPassword(result);
    addToast(`Generated assigned member password: ${result}`, 'info');
  };

  const filteredMembers = members.filter(m => {
    const matchesBarangay = selectedBarangay === 'ALL' || m.barangay === selectedBarangay;
    const matchesStatus = selectedStatus === 'ALL' || m.membershipStatus === selectedStatus;
    const matchesGmail = !onlyGmailAccess || (m.email && m.email.toLowerCase().includes('gmail.com'));
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchesBarangay && matchesStatus && matchesGmail;
    const matchesSearch = (m.fullName || '').toLowerCase().includes(q) ||
                          (m.memberId || '').toLowerCase().includes(q) ||
                          (m.email || '').toLowerCase().includes(q) ||
                          (m.barangay || '').toLowerCase().includes(q);
    return matchesBarangay && matchesStatus && matchesGmail && matchesSearch;
  });

  const gmailAuthorizedCount = members.filter(m => m.email && m.membershipStatus === 'Active').length;
  const pendingCount = members.filter(m => m.membershipStatus === 'Pending').length;

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormContact('+63 9');
    setFormBarangay(GUIMBA_BARANGAYS[0]);
    setFormBirthdate('2004-01-01');
    setFormGender('Male');
    setFormEducation('College / University');
    setFormStatus('Active');
    setFormPosition('Youth Member');
    setFormCommittee('General Youth Volunteer');
    setFormAddress('');
    setFormGmailAccess(true);
    setFormPortalPassword('PagasaMember2026');
    setShowPasswordInModal(false);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.fullName);
    setFormEmail(m.email);
    setFormContact(m.contactNumber);
    setFormBarangay(m.barangay);
    setFormBirthdate(m.birthdate);
    setFormGender(m.gender);
    setFormEducation(m.educationalStatus);
    setFormStatus(m.membershipStatus);
    setFormPosition(m.organizationPosition || 'Youth Member');
    setFormCommittee(m.committee || 'General Youth Volunteer');
    setFormAddress(m.address);
    setFormGmailAccess(m.gmailAccessEnabled !== false);
    setFormPortalPassword(m.portalPassword || 'PagasaMember2026');
    setShowPasswordInModal(false);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const birthYear = new Date(formBirthdate).getFullYear();
    const age = Math.max(15, 2026 - birthYear);
    const cleanedEmail = formEmail.trim().toLowerCase();
    const assignedPassword = formPortalPassword.trim() || 'PagasaMember2026';

    if (editingMember) {
      updateMember(editingMember.id, {
        fullName: formName.trim(),
        email: cleanedEmail,
        contactNumber: formContact,
        barangay: formBarangay,
        birthdate: formBirthdate,
        age,
        gender: formGender,
        educationalStatus: formEducation,
        membershipStatus: formStatus,
        organizationPosition: formPosition,
        committee: formCommittee,
        address: formAddress,
        gmailAccessEnabled: formGmailAccess,
        portalPassword: assignedPassword
      });
      addToast(`Member record for ${formName} updated. Gmail Portal Access: ${formStatus === 'Active' ? 'Enabled' : 'Pending'}`, 'success');
    } else {
      const newMember = addMember({
        fullName: formName.trim(),
        email: cleanedEmail,
        contactNumber: formContact,
        birthdate: formBirthdate,
        age,
        gender: formGender,
        address: formAddress || `Purok 1, Brgy. ${formBarangay}, Guimba`,
        barangay: formBarangay,
        educationalStatus: formEducation,
        occupation: 'Youth Member / Student',
        profilePicture: formGender === 'Female' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        membershipStatus: formStatus,
        organizationPosition: formPosition,
        committee: formCommittee,
        gmailAccessEnabled: formGmailAccess,
        portalPassword: assignedPassword,
        emergencyContact: {
          name: 'Family Contact',
          relationship: 'Parent / Guardian',
          contactNumber: formContact
        }
      });
      addToast(`Added new member ${formName} (${newMember.memberId})! Authorized Gmail: ${cleanedEmail} | Password: ${assignedPassword}`, 'success');
    }

    setIsCreateModalOpen(false);
  };

  const handleQuickApprove = (m: Member) => {
    updateMember(m.id, { membershipStatus: 'Active', gmailAccessEnabled: true });
    addToast(`Approved member ${m.fullName}. Gmail portal access granted for ${m.email}!`, 'success');
  };

  const handleCopyCredentials = (m: Member) => {
    const password = m.portalPassword || 'PagasaMember2026';
    const message = `🇵🇭 PAGASA GUIMBA YOUTH MIS - MEMBER PORTAL CREDENTIALS\n\n` +
      `Mabuhay, ${m.fullName}!\n` +
      `An administrator has registered your authorized account in the PAGASA Member Portal.\n\n` +
      `🔗 Portal Access URL: ${window.location.origin}\n` +
      `👤 Member ID: ${m.memberId}\n` +
      `📧 Authorized Gmail: ${m.email}\n` +
      `🔑 Given Password: ${password}\n` +
      `📍 Barangay: Brgy. ${m.barangay}\n\n` +
      `You can now sign in using your Gmail and the given password above to view official events, claim e-certificates, and present your Digital QR ID.`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      addToast(`Copied portal invitation & Gmail credentials for ${m.fullName}!`, 'success');
    }
  };

  const handleTestLoginAsMember = (m: Member) => {
    const userPayload: User = {
      id: m.id,
      name: m.fullName,
      email: m.email,
      role: 'MEMBER',
      avatar: m.profilePicture,
      memberId: m.memberId
    };
    switchRole('MEMBER', userPayload);
  };

  const handleExportCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Gmail / Email', 'Barangay', 'Age', 'Gender', 'Education', 'Status', 'Committee', 'Date Joined'];
    const rows = filteredMembers.map(m => [
      `"${m.memberId}"`,
      `"${m.fullName}"`,
      `"${m.email}"`,
      `"${m.barangay}"`,
      m.age,
      `"${m.gender}"`,
      `"${m.educationalStatus}"`,
      `"${m.membershipStatus}"`,
      `"${m.committee || 'General Volunteer'}"`,
      `"${m.dateJoined || m.membershipDate || '2026-01-01'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PAGASA_Guimba_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Member directory exported to CSV.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-900">
              Youth Member Directory & User Access
            </h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Gmail Authorized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add authorized users with Gmail addresses to grant instant access to the Member Portal ({filteredMembers.length} records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User / Member (Gmail)</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">{members.length}</p>
          <span className="text-[10px] text-slate-400">All registered youth</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Gmail Authorized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-display">{gmailAuthorizedCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Can sign in with Gmail</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-display">{pendingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting admin approval</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Barangays</span>
            <Shield className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">
            {new Set(members.map(m => m.barangay)).size}
          </p>
          <span className="text-[10px] text-slate-400">Guimba communities</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, Gmail, Member ID, barangay..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gmail Filter Toggle */}
          <button
            onClick={() => setOnlyGmailAccess(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyGmailAccess 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>{onlyGmailAccess ? 'Showing Gmail Users' : 'Filter by Gmail'}</span>
          </button>

          {/* Barangay Dropdown */}
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Barangays</option>
            {GUIMBA_BARANGAYS.map((b) => (
              <option key={b} value={b}>Brgy. {b}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active (Portal Access Enabled)</option>
            <option value="Pending">Pending Review</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Member & Gmail Access</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Barangay</th>
                <th className="py-3.5 px-4">Committee / Role</th>
                <th className="py-3.5 px-4">Portal Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 text-sm">No members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different name or Gmail address, or add a new user.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative group cursor-pointer flex-shrink-0"
                          onClick={() => setPhotoTargetMember(m)}
                          title="Click to change member photo"
                        >
                          <img
                            src={m.profilePicture}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:brightness-90 transition-all"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{m.fullName}</p>
                            {m.membershipStatus === 'Active' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Authorized to access Member Portal with this Gmail">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Gmail Active
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                            <div className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              <Mail className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span>{m.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title="Assigned Member Portal Password">
                              <Lock className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
                              <span>Pwd: <strong className="text-slate-900">{m.portalPassword || 'PagasaMember2026'}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 border border-slate-200">
                        {m.memberId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      Brgy. {m.barangay}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{m.organizationPosition || 'Youth Member'}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{m.committee || 'General Volunteer'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        m.membershipStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        m.membershipStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {m.membershipStatus === 'Active' ? 'Portal Active' : m.membershipStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {m.membershipStatus === 'Pending' && (
                          <button
                            onClick={() => handleQuickApprove(m)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Approve Member & Enable Gmail Access"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyCredentials(m)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Copy Member Login Details & Invite"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTestLoginAsMember(m)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Log In As This Member (Preview Portal)"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingMember(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Digital QR Pass"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            confirmAction({
                              title: 'Remove Member Record',
                              message: `Are you sure you want to remove ${m.fullName}? This will revoke their Gmail portal access and delete their registration pass.`,
                              confirmText: 'Delete Member',
                              cancelText: 'Keep Member',
                              variant: 'danger',
                              itemDetails: {
                                label: 'Youth Member Details',
                                value: `${m.fullName} (${m.memberId})`,
                                subValue: m.email ? `Email: ${m.email} • Brgy. ${m.barangay}` : `Barangay: ${m.barangay}`
                              },
                              onConfirm: () => {
                                deleteMember(m.id);
                                addToast(`Member ${m.fullName} deleted successfully.`, 'info');
                              }
                            });
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member QR / Detail Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center relative">
            <button
              onClick={() => setViewingMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={viewingMember.profilePicture}
              alt=""
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-blue-600 shadow-md"
            />
            <div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {viewingMember.memberId}
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-display mt-1">{viewingMember.fullName}</h3>
              <p className="text-xs text-slate-500">Brgy. {viewingMember.barangay}, Guimba</p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span className="font-mono">{viewingMember.email}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <QRCodeSVG value={viewingMember.qrCode || viewingMember.memberId} size={150} />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  handleTestLoginAsMember(viewingMember);
                  setViewingMember(null);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Open {viewingMember.fullName}'s Portal</span>
              </button>
              
              <button
                onClick={() => setViewingMember(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Member Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingMember ? 'Edit User & Member Access' : 'Add User for Member Portal'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter member details and Gmail to grant access to the Member Portal.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Member Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Gmail / Official Email & Portal Access Callout */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>Member Gmail Address (For Portal Login) *</span>
                  </label>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                    OAuth / Sign-In
                  </span>
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. juan.delacruz@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <p className="text-[11px] text-blue-800 leading-tight">
                  The user will use this specific Gmail address to access their private Member Portal.
                </p>
              </div>

              {/* Specific Given Portal Password Block */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Specific Assigned Portal Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100/80 hover:bg-blue-200/80 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    required
                    placeholder="e.g. PagasaMember2026"
                    value={formPortalPassword}
                    onChange={(e) => setFormPortalPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Give this password to the member. Only users with this Gmail and assigned password can sign in.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Barangay (Guimba) *</label>
                  <select
                    value={formBarangay}
                    onChange={(e) => setFormBarangay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    {GUIMBA_BARANGAYS.map((b) => (
                      <option key={b} value={b}>Brgy. {b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+63 917 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Birthdate</label>
                  <input
                    type="date"
                    value={formBirthdate}
                    onChange={(e) => setFormBirthdate(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Membership Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Active">Active (Instant Access)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="Youth Member / Coordinator"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Committee</label>
                  <input
                    type="text"
                    value={formCommittee}
                    onChange={(e) => setFormCommittee(e.target.value)}
                    placeholder="General Youth Volunteer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Address / Purok</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Purok 1, Sitio, Landmark"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors mt-2 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {editingMember ? 'Save Member Updates' : 'Add User & Authorize Gmail Portal Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Member Profile Picture Modal */}
      {photoTargetMember && (
        <ChangeProfilePictureModal
          isOpen={!!photoTargetMember}
          onClose={() => setPhotoTargetMember(null)}
          userType="member"
          targetMemberId={photoTargetMember.id}
          initialAvatar={photoTargetMember.profilePicture}
          title={`Change ${photoTargetMember.fullName}'s Profile Picture`}
        />
      )}
    </div>
  );
};
