import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmailLogItem } from '../../types';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  RefreshCw, 
  ExternalLink,
  Search,
  Key,
  ShieldAlert,
  Calendar,
  User
} from 'lucide-react';

interface AdminEmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEmailLogsModal: React.FC<AdminEmailLogsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { emailLogs, resendCredentialsEmail, members, showToast } = useApp();
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = emailLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      log.recipientEmail.toLowerCase().includes(q) ||
      log.recipientName.toLowerCase().includes(q) ||
      (log.username && log.username.toLowerCase().includes(q)) ||
      log.subject.toLowerCase().includes(q)
    );
  });

  const handleResendFromLog = async (log: EmailLogItem) => {
    const matchedMember = members.find(m => m.email.toLowerCase() === log.recipientEmail.toLowerCase());
    if (!matchedMember) {
      showToast('error', 'Member Not Found', 'Could not locate the member record to resend.');
      return;
    }

    setResendingId(log.id);
    try {
      const res = await resendCredentialsEmail(matchedMember.id);
      if (res.success) {
        showToast('success', 'Email Resent', res.message);
      }
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to resend.');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Automated Email Outbox & Delivery Logs</h2>
              <p className="text-xs text-slate-400">View real-time automated credential dispatch receipts and templates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipient, Gmail, or username..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filteredLogs.length}</span> Total Dispatches
          </div>
        </div>

        {/* Main Content: Split List + Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Logs List */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold text-slate-600">No email logs found</p>
                <p className="text-[11px] text-slate-400">Dispatched credential emails will automatically appear here.</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-4 transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{log.recipientName}</p>
                        <p className="text-[11px] text-blue-600 font-medium truncate">{log.recipientEmail}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {log.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[140px]">{log.subject}</span>
                      <span className="text-[10px] font-mono">{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email Preview Area */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-slate-100 flex flex-col justify-between">
            {selectedLog ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{selectedLog.subject}</h3>
                    <button
                      type="button"
                      onClick={() => handleResendFromLog(selectedLog)}
                      disabled={resendingId === selectedLog.id}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingId === selectedLog.id ? 'animate-spin' : ''}`} />
                      <span>{resendingId === selectedLog.id ? 'Resending...' : 'Resend Email'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">Recipient:</span> <strong>{selectedLog.recipientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Gmail:</span> <strong>{selectedLog.recipientEmail}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Assigned Username:</span> <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">{selectedLog.username || 'N/A'}</code>
                    </div>
                    <div>
                      <span className="text-slate-400">Dispatched At:</span> <span>{new Date(selectedLog.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rendered HTML */}
                <div 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2"
                  dangerouslySetInnerHTML={{ __html: selectedLog.htmlBody }}
                />
              </div>
            ) : (
              <div className="my-auto text-center text-slate-400 space-y-2 p-8">
                <Mail className="w-12 h-12 mx-auto opacity-30 text-blue-600" />
                <p className="text-sm font-bold text-slate-700">Select an email to preview</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click on any dispatch record in the left panel to inspect the actual email template and delivery receipt.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Automated SMTP simulation active • Real-time dispatch receipts logged</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};
