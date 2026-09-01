import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  UserRole,
  Member,
  EventItem,
  EventRegistration,
  AttendanceSession,
  AttendanceRecord,
  ProjectItem,
  ActivityItem,
  AnnouncementItem,
  OfficialItem,
  CertificateItem,
  GalleryPhoto,
  OrganizationSettings,
  NotificationItem,
  AuditLogItem,
  AttendanceStatus,
  MembershipStatus,
  ThemeMode,
  ColorPalette
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_OFFICIALS,
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PROJECTS,
  INITIAL_ACTIVITIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
  INITIAL_CERTIFICATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signOutFirebase,
  subscribeToAuth
} from '../firebase/firestoreService';
import {
  storageService,
  StorageSnapshot,
  STORAGE_KEYS
} from '../services/localStorageService';

export function formatNameFromEmail(email: string): string {
  if (!email) return 'Youth Member';
  const prefix = email.split('@')[0] || '';
  
  if (prefix.toLowerCase().includes('giancarlo') || prefix.toLowerCase().includes('gian.carlo') || prefix.toLowerCase().includes('gian_carlo')) {
    return 'Gian Carlo Magat';
  }
  
  const cleaned = prefix
    .replace(/[0-9]+/g, '')
    .replace(/[._-]+/g, ' ')
    .trim();
    
  if (!cleaned) return 'Youth Member';
  
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export type ActivePage = 
  | 'home'
  | 'about'
  | 'officials'
  | 'events'
  | 'event-detail'
  | 'projects'
  | 'activities'
  | 'announcements'
  | 'gallery'
  | 'join'
  | 'member-dashboard'
  | 'member-profile'
  | 'member-qr'
  | 'member-events'
  | 'member-attendance'
  | 'member-certificates'
  | 'admin-dashboard'
  | 'admin-members'
  | 'admin-attendance'
  | 'admin-events'
  | 'admin-projects'
  | 'admin-activities'
  | 'admin-announcements'
  | 'admin-gallery'
  | 'admin-officials'
  | 'admin-certificates'
  | 'admin-reports'
  | 'admin-audit'
  | 'admin-audit-logs'
  | 'admin-settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & User State
  currentUser: User | null;
  currentMember: Member;
  currentRole: UserRole;
  currentPage: ActivePage;
  selectedEventId: string | null;
  selectedMemberId: string | null;
  activeCertificate: CertificateItem | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'admin-login';
  isGlobalSearchOpen: boolean;
  toasts: ToastMessage[];

  // Theme & Accessibility State
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  colorPalette: ColorPalette;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setColorPalette: (palette: ColorPalette) => void;

  // Setters
  setCurrentPage: (page: ActivePage) => void;
  setSelectedEventId: (id: string | null) => void;
  setSelectedMemberId: (id: string | null) => void;
  setActiveCertificate: (cert: CertificateItem | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'admin-login') => void;
  setIsGlobalSearchOpen: (open: boolean) => void;
  
  // Role & Auth functions
  switchRole: (role: UserRole, userPayload?: User) => void;
  loginUser: (email: string, role?: UserRole) => boolean;
  loginWithSupabase: (email: string, password: string, targetRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  signUpWithSupabase: (email: string, password: string, memberData: Omit<Member, 'id' | 'memberId' | 'membershipDate' | 'stats'>) => Promise<{ success: boolean; message?: string; memberId?: string }>;
  resetUserPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<boolean>;
  logoutUser: () => Promise<void>;
  isSupabaseConfigured: () => boolean;
  updateCurrentUser: (updates: Partial<User>) => void;
  updateUserProfilePicture: (avatarUrl: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Data Collections & Local Storage Provider Ops
  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
  resetToDefaults: () => void;
  exportStateSnapshot: () => StorageSnapshot;
  restoreStateSnapshot: (snapshot: StorageSnapshot) => { success: boolean; message: string; counts?: Record<string, number> };
  getStorageMetrics: () => { usedBytes: number; formattedSize: string; itemCounts: Record<string, number> };
  
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'memberId' | 'membershipDate' | 'stats'>) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  updateMemberStatus: (id: string, status: MembershipStatus) => void;
  deleteMember: (id: string) => void;

  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id' | 'currentParticipants' | 'createdAt'>) => EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, memberInfo: { memberId: string; name: string; email: string }) => { success: boolean; message: string };
  cancelEventRegistration: (eventId: string, memberId: string) => void;
  isMemberRegisteredForEvent: (eventId: string, memberId: string) => boolean;

  registrations: EventRegistration[];

  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  createAttendanceSession: (eventId: string, startTime: string, endTime: string, location: string) => AttendanceSession;
  toggleAttendanceSession: (sessionId: string, isOpen: boolean) => void;
  recordAttendance: (
    sessionId: string, 
    memberId: string, 
    method: 'QR_SCAN' | 'MANUAL' | 'SEARCH',
    statusOverride?: AttendanceStatus,
    remarks?: string
  ) => { success: boolean; message: string; record?: AttendanceRecord; isDuplicate?: boolean };
  updateAttendanceRecordStatus: (recordId: string, status: AttendanceStatus, remarks?: string) => void;
  deleteAttendanceRecord: (recordId: string) => void;

  projects: ProjectItem[];
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;

  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void;
  deleteActivity: (id: string) => void;

  announcements: AnnouncementItem[];
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'views'>) => void;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => void;
  deleteAnnouncement: (id: string) => void;

  gallery: GalleryPhoto[];
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  deleteGalleryPhoto: (id: string) => void;

  officials: OfficialItem[];
  addOfficial: (official: Omit<OfficialItem, 'id'>) => void;
  updateOfficial: (id: string, updates: Partial<OfficialItem>) => void;
  deleteOfficial: (id: string) => void;

  certificates: CertificateItem[];
  issueCertificate: (cert: Omit<CertificateItem, 'id' | 'certificateNumber' | 'qrVerificationUrl'>) => CertificateItem;
  deleteCertificate: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type: NotificationItem['type']) => void;

  auditLogs: AuditLogItem[];
  logAuditEvent: (action: string, module: AuditLogItem['module'], details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & User Session from Local Storage Service
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = storageService.getUserSession();
    return session.user;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const session = storageService.getUserSession();
    return session.role;
  });

  const [currentPage, setCurrentPageState] = useState<ActivePage>(() => {
    const saved = storageService.getLastActivePage('home') as ActivePage;
    return saved || 'home';
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<CertificateItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin-login'>('login');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme & Accessibility State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return storageService.getTheme();
  });

  const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => {
    return storageService.getColorPalette();
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Synchronize Theme & CSS attributes dynamically
  useEffect(() => {
    let resolvedTheme: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = isSystemDark ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }
    setEffectiveTheme(resolvedTheme);

    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    root.setAttribute('data-palette', colorPalette);
    storageService.setTheme(theme);
    storageService.setColorPalette(colorPalette);
  }, [theme, colorPalette]);

  const setCurrentPage = (page: ActivePage) => {
    setCurrentPageState(page);
    storageService.setLastActivePage(page);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    showToast('info', 'Display Mode', `Theme changed to ${newTheme === 'system' ? 'System Default' : newTheme.toUpperCase() + ' Mode'}`);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setColorPalette = (newPalette: ColorPalette) => {
    setColorPaletteState(newPalette);
    const paletteNames: Record<ColorPalette, string> = {
      default: 'Civic Blue',
      emerald: 'Emerald Youth',
      purple: 'Royal Purple',
      sunset: 'Sunset Orange',
      ocean: 'Ocean Cyan',
      'high-contrast': 'High Contrast'
    };
    showToast('success', 'Color Palette', `Active palette updated to ${paletteNames[newPalette] || newPalette}`);
  };

  // Persistent Collections in LocalStorage Provider
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    return storageService.loadSettings();
  });

  const [members, setMembers] = useState<Member[]>(() => {
    return storageService.loadMembers();
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    return storageService.loadEvents();
  });

  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => {
    return storageService.loadRegistrations();
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    return storageService.loadAttendanceSessions();
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    return storageService.loadAttendanceRecords();
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    return storageService.loadProjects();
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    return storageService.loadActivities();
  });

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    return storageService.loadAnnouncements();
  });

  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => {
    return storageService.loadGallery();
  });

  const [officials, setOfficials] = useState<OfficialItem[]>(() => {
    return storageService.loadOfficials();
  });

  const [certificates, setCertificates] = useState<CertificateItem[]>(() => {
    return storageService.loadCertificates();
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return storageService.loadNotifications();
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    return storageService.loadAuditLogs();
  });

  // Local storage synchronization via Service Provider
  useEffect(() => {
    storageService.saveUserSession(currentUser, currentRole);
  }, [currentUser, currentRole]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveMembers(members);
  }, [members]);

  useEffect(() => {
    storageService.saveEvents(events);
  }, [events]);

  useEffect(() => {
    storageService.saveRegistrations(registrations);
  }, [registrations]);

  useEffect(() => {
    storageService.saveAttendanceSessions(attendanceSessions);
  }, [attendanceSessions]);

  useEffect(() => {
    storageService.saveAttendanceRecords(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storageService.saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    storageService.saveAnnouncements(announcements);
  }, [announcements]);

  useEffect(() => {
    storageService.saveGallery(gallery);
  }, [gallery]);

  useEffect(() => {
    storageService.saveOfficials(officials);
  }, [officials]);

  useEffect(() => {
    storageService.saveCertificates(certificates);
  }, [certificates]);

  useEffect(() => {
    storageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Cross-tab synchronization listener
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.USER || e.key === STORAGE_KEYS.ROLE) {
        const session = storageService.getUserSession();
        setCurrentUser(session.user);
        setCurrentRole(session.role);
      } else if (e.key === STORAGE_KEYS.MEMBERS) {
        setMembers(storageService.loadMembers());
      } else if (e.key === STORAGE_KEYS.EVENTS) {
        setEvents(storageService.loadEvents());
      } else if (e.key === STORAGE_KEYS.ATTENDANCE_SESSIONS) {
        setAttendanceSessions(storageService.loadAttendanceSessions());
      } else if (e.key === STORAGE_KEYS.ATTENDANCE_RECORDS) {
        setAttendanceRecords(storageService.loadAttendanceRecords());
      } else if (e.key === STORAGE_KEYS.SETTINGS) {
        setSettings(storageService.loadSettings());
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Sync Firebase Auth state if active session exists
  useEffect(() => {
    const unsubscribe = subscribeToAuth((fbUser) => {
      if (fbUser) {
        const email = fbUser.email || '';
        const trimmedEmail = email.toLowerCase().trim();
        const isSuperAdmin = trimmedEmail === 'giancarlomagat2104@gmail.com' || 
                             trimmedEmail === 'giancarlomagat19@gmail.com' || 
                             trimmedEmail.includes('admin');
        const displayName = fbUser.displayName || formatNameFromEmail(trimmedEmail);

        setCurrentUser(prev => {
          // If already set with correct name, keep it
          if (prev && prev.email.toLowerCase() === trimmedEmail && prev.name === displayName) {
            return prev;
          }
          const matched = members.find(m => m.email.toLowerCase().trim() === trimmedEmail);
          const memberId = matched?.memberId || `PAGASA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

          const userObj: User = {
            id: fbUser.uid,
            name: displayName,
            email: email,
            role: isSuperAdmin ? 'SUPER_ADMIN' : (prev?.role || (matched ? 'MEMBER' : 'MEMBER')),
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
            memberId
          };
          return userObj;
        });
      }
    });
    return () => unsubscribe();
  }, [members]);

  // Derived currentMember representing the authenticated user accurately
  const currentMember: Member = useMemo(() => {
    if (currentUser) {
      const trimmedEmail = currentUser.email?.toLowerCase().trim();
      const matched = members.find(m => 
        (m.id && m.id === currentUser.id) ||
        (trimmedEmail && m.email?.toLowerCase().trim() === trimmedEmail) ||
        (currentUser.memberId && m.memberId === currentUser.memberId)
      );
      if (matched) {
        return {
          ...matched,
          fullName: currentUser.name || matched.fullName,
          email: currentUser.email || matched.email,
          profilePicture: currentUser.avatar || matched.profilePicture
        };
      }
      return {
        id: currentUser.id || 'mem-' + (currentUser.email || 'current'),
        memberId: currentUser.memberId || 'PAGASA-2026-0001',
        fullName: currentUser.name || 'Youth Member',
        email: currentUser.email || 'member@pagasaguimba.org',
        contactNumber: '+63 917 554 8920',
        birthdate: '2004-01-01',
        age: 22,
        gender: 'Male',
        address: 'Brgy. Saint John District (Poblacion), Guimba',
        barangay: 'Saint John District (Poblacion)',
        educationalStatus: 'College / University',
        occupation: currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? 'President & Executive Administrator' : 'Active Youth Member',
        profilePicture: currentUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`,
        membershipStatus: 'Active',
        membershipDate: '2026-01-01',
        organizationPosition: currentUser.role === 'SUPER_ADMIN' ? 'President' : currentUser.role === 'ADMIN' ? 'Officer & Administrator' : 'Youth Member',
        committee: currentUser.role === 'SUPER_ADMIN' ? 'Executive Board' : 'General Youth Volunteer',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent / Guardian',
          contactNumber: '+63 917 554 8920'
        },
        registeredEventIds: [],
        stats: {
          eventsJoined: 0,
          totalAttendance: 0,
          attendanceRate: 100,
          volunteerHours: 0,
          projectsParticipated: 0,
          certificatesEarned: 0
        }
      };
    }
    return members[0] || {
      id: 'mem-fallback',
      memberId: 'PAGASA-2026-0001',
      fullName: 'Youth Member',
      email: 'member@pagasaguimba.org',
      contactNumber: '+63 917 554 8920',
      birthdate: '2004-01-01',
      age: 22,
      gender: 'Male',
      address: 'Brgy. Saint John District (Poblacion), Guimba',
      barangay: 'Saint John District (Poblacion)',
      educationalStatus: 'College / University',
      occupation: 'Active Youth Member',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      membershipStatus: 'Active',
      membershipDate: '2026-01-01',
      organizationPosition: 'Youth Member',
      committee: 'General Youth Volunteer',
      emergencyContact: {
        name: 'Parent / Guardian',
        relationship: 'Parent',
        contactNumber: '+63 917 554 8920'
      },
      registeredEventIds: [],
      stats: {
        eventsJoined: 0,
        totalAttendance: 0,
        attendanceRate: 100,
        volunteerHours: 0,
        projectsParticipated: 0,
        certificatesEarned: 0
      }
    };
  }, [currentUser, members]);

  // Toast Helpers
  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const title = type === 'success' ? 'Success' : type === 'error' ? 'Notice' : type === 'warning' ? 'Warning' : 'System';
    showToast(type, title, message);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Audit Logger
  const logAuditEvent = (action: string, module: AuditLogItem['module'], details: string) => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      userName: currentUser ? currentUser.name : 'System Administrator',
      userRole: currentRole,
      action,
      module,
      details,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ipAddress: '192.168.1.45 (PAGASA MIS Portal)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Notifications
  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('info', 'Notifications', 'All notifications marked as read.');
  };

  // Switch Role
  const switchRole = (role: UserRole, userPayload?: User) => {
    setCurrentRole(role);
    if (userPayload) {
      setCurrentUser(userPayload);
      storageService.saveUserSession(userPayload, role);
    } else {
      let targetUser: User | null = null;
      if (role === 'SUPER_ADMIN') {
        targetUser = INITIAL_USERS[0];
      } else if (role === 'ADMIN') {
        targetUser = { ...INITIAL_USERS[0], role: 'ADMIN' };
      } else if (role === 'MEMBER') {
        targetUser = INITIAL_USERS[1];
      }
      setCurrentUser(targetUser);
      storageService.saveUserSession(targetUser, role);
    }
    
    // Auto navigate to relevant dashboard
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      setCurrentPage('admin-dashboard');
      showToast('success', 'Role Switched', `Logged in as Administrator (${role})`);
    } else if (role === 'MEMBER') {
      setCurrentPage('member-dashboard');
      showToast('success', 'Welcome Back!', `Logged in as Member (${userPayload?.name || 'Youth Member'})`);
    } else {
      setCurrentPage('home');
      showToast('info', 'Guest View', 'Browsing as Guest / Public Visitor');
    }
  };

  const isSupabaseConfigured = () => false;

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const authUser = await firebaseGoogleSignIn();
      if (!authUser) {
        showToast('error', 'Google Sign-In', 'Google sign-in was cancelled or encountered an error.');
        return false;
      }

      const email = authUser.email || '';
      const trimmedEmail = email.toLowerCase().trim();
      const isSuperAdmin = trimmedEmail === 'giancarlomagat19@gmail.com' || 
                           trimmedEmail === 'giancarlomagat2104@gmail.com' || 
                           trimmedEmail.includes('admin');

      const matchedMember = members.find(m => m.email.toLowerCase().trim() === trimmedEmail);
      const fetchedName = authUser.name || (matchedMember ? matchedMember.fullName : formatNameFromEmail(trimmedEmail));
      const memberId = matchedMember?.memberId || `PAGASA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      if (matchedMember) {
        setMembers(prev => prev.map(m => m.id === matchedMember.id ? {
          ...m,
          fullName: fetchedName,
          profilePicture: authUser.avatar || m.profilePicture
        } : m));
      } else {
        const newMember: Member = {
          id: authUser.id || 'mem-' + Date.now(),
          memberId: memberId,
          fullName: fetchedName,
          email: email,
          contactNumber: '+63 917 554 8920',
          birthdate: '2004-01-01',
          age: 22,
          gender: 'Male',
          address: 'Brgy. Saint John District (Poblacion), Guimba',
          barangay: 'Saint John District (Poblacion)',
          educationalStatus: 'College / University',
          occupation: isSuperAdmin ? 'President & Executive Administrator' : 'Active Youth Member',
          profilePicture: authUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fetchedName)}`,
          membershipStatus: 'Active',
          membershipDate: '2026-01-01',
          organizationPosition: isSuperAdmin ? 'President' : 'Youth Member',
          committee: isSuperAdmin ? 'Executive Board' : 'General Youth Volunteer',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Parent / Guardian',
            contactNumber: '+63 917 554 8920'
          },
          registeredEventIds: [],
          stats: {
            eventsJoined: 0,
            totalAttendance: 0,
            attendanceRate: 100,
            volunteerHours: 0,
            projectsParticipated: 0,
            certificatesEarned: 0
          }
        };
        setMembers(prev => [newMember, ...prev.filter(m => m.email.toLowerCase().trim() !== trimmedEmail)]);
      }

      const userObj: User = {
        id: authUser.id,
        name: fetchedName,
        email: email,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'MEMBER',
        avatar: authUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fetchedName)}`,
        memberId: memberId
      };

      switchRole(userObj.role, userObj);
      logAuditEvent('Google Sign-In', 'Settings', `User signed in with Google: ${email} (${fetchedName})`);
      showToast('success', `Welcome, ${fetchedName}!`, `Successfully logged in via Google account.`);
      return true;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      showToast('error', 'Google Sign-In Failed', err?.message || 'Authentication error.');
      return false;
    }
  };

  const loginUser = (emailOrIdentifier: string, targetRole?: UserRole, providedName?: string): boolean => {
    const input = emailOrIdentifier.trim().toLowerCase();
    const matchedMember = members.find(m => 
      m.email.toLowerCase().trim() === input || 
      m.memberId.toLowerCase().trim() === input
    );
    const matchedOfficial = officials.find(o => 
      o.contactEmail?.toLowerCase().trim() === input ||
      o.fullName.toLowerCase().trim() === input
    );
    const matchedUser = INITIAL_USERS.find(u => 
      u.email.toLowerCase().trim() === input ||
      u.memberId?.toLowerCase().trim() === input
    );

    let resolvedName = providedName?.trim() || '';
    if (!resolvedName) {
      if (matchedMember) {
        resolvedName = matchedMember.fullName;
      } else if (matchedOfficial) {
        resolvedName = matchedOfficial.fullName;
      } else if (matchedUser) {
        resolvedName = matchedUser.name;
      } else {
        resolvedName = formatNameFromEmail(input);
      }
    }

    const isSuperAdmin = targetRole === 'SUPER_ADMIN' || 
                         targetRole === 'ADMIN' || 
                         input.includes('admin') || 
                         input === 'giancarlomagat19@gmail.com' || 
                         input === 'giancarlomagat2104@gmail.com';
    const effectiveRole: UserRole = isSuperAdmin ? (targetRole || 'SUPER_ADMIN') : 'MEMBER';

    if (matchedMember) {
      if (matchedMember.membershipStatus === 'Pending') {
        showToast('warning', 'Application Pending Approval', 'Your membership registration is currently pending review by an administrator.');
        return false;
      }
      if (matchedMember.membershipStatus === 'Suspended' || matchedMember.membershipStatus === 'Inactive') {
        showToast('error', 'Member Portal Access Disabled', 'This member account is currently inactive or suspended. Please contact an organization administrator.');
        return false;
      }
      
      const userObj: User = {
        id: matchedMember.id,
        name: resolvedName || matchedMember.fullName,
        email: matchedMember.email,
        role: effectiveRole,
        avatar: matchedMember.profilePicture,
        memberId: matchedMember.memberId
      };
      switchRole(effectiveRole, userObj);
      showToast('success', `Welcome back, ${userObj.name}!`, `Logged in to PAGASA Member Portal.`);
      return true;
    }

    // New member registration/login automatically with exact name
    const newMemberId = `PAGASA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMember: Member = {
      id: 'mem-' + Date.now(),
      memberId: newMemberId,
      fullName: resolvedName,
      email: input.includes('@') ? input : `${input.toLowerCase()}@pagasaguimba.org`,
      contactNumber: '+63 917 554 8920',
      birthdate: '2004-01-01',
      age: 22,
      gender: 'Male',
      address: 'Brgy. Saint John District (Poblacion), Guimba',
      barangay: 'Saint John District (Poblacion)',
      educationalStatus: 'College / University',
      occupation: isSuperAdmin ? 'President & Executive Administrator' : 'Active Youth Member',
      profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(resolvedName)}`,
      membershipStatus: 'Active',
      membershipDate: '2026-01-01',
      organizationPosition: isSuperAdmin ? 'President' : 'Youth Member',
      committee: isSuperAdmin ? 'Executive Board' : 'General Youth Volunteer',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Parent / Guardian',
        contactNumber: '+63 917 554 8920'
      },
      registeredEventIds: [],
      stats: {
        eventsJoined: 0,
        totalAttendance: 0,
        attendanceRate: 100,
        volunteerHours: 0,
        projectsParticipated: 0,
        certificatesEarned: 0
      }
    };

    setMembers(prev => [newMember, ...prev.filter(m => m.email.toLowerCase().trim() !== newMember.email.toLowerCase().trim())]);

    const userObj: User = {
      id: newMember.id,
      name: resolvedName,
      email: newMember.email,
      role: effectiveRole,
      avatar: newMember.profilePicture,
      memberId: newMember.memberId
    };

    switchRole(effectiveRole, userObj);
    showToast('success', `Welcome, ${resolvedName}!`, `Signed in to PAGASA Portal.`);
    return true;
  };

  const loginWithSupabase = async (
    email: string,
    _password: string,
    targetRole?: UserRole,
    providedName?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const ok = loginUser(email, targetRole, providedName);
    if (ok) {
      return { success: true };
    }
    return { success: false, message: 'Could not log in with provided credentials.' };
  };

  const signUpWithSupabase = async (
    _email: string,
    _password: string,
    memberData: Omit<Member, 'id' | 'memberId' | 'membershipDate' | 'stats'>
  ): Promise<{ success: boolean; message?: string; memberId?: string }> => {
    const createdMember = addMember(memberData);
    logAuditEvent('Member Registration', 'Members', `Registered new member: ${memberData.fullName} (${createdMember.memberId}).`);
    return { success: true, memberId: createdMember.memberId };
  };

  const resetUserPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    showToast('success', 'Password Reset Requested', `Password reset instructions sent to ${email}.`);
    return { success: true, message: `Password reset instructions sent to ${email}.` };
  };

  const logoutUser = async () => {
    signOutFirebase().catch(console.error);
    storageService.clearUserSession();
    setCurrentUser(null);
    setCurrentRole('GUEST');
    setCurrentPage('home');
    showToast('info', 'Logged Out', 'You have been signed out successfully.');
  };

  // Profile & Avatar Updates
  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      storageService.saveUserSession(updated, currentRole);
      return updated;
    });

    if (updates.avatar || updates.name) {
      setMembers(prev => prev.map(m => {
        if (m.id === currentUser?.id || m.memberId === currentUser?.memberId || (currentUser?.email && m.email.toLowerCase() === currentUser.email.toLowerCase())) {
          return {
            ...m,
            ...(updates.avatar ? { profilePicture: updates.avatar } : {}),
            ...(updates.name ? { fullName: updates.name } : {})
          };
        }
        return m;
      }));
    }

    logAuditEvent('Updated User Profile', 'Settings', `User ${updates.name || currentUser?.name || 'Account'} updated profile details.`);
  };

  const updateUserProfilePicture = (avatarUrl: string) => {
    updateCurrentUser({ avatar: avatarUrl });
  };

  // Settings & Snapshot Exports
  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storageService.saveSettings(updated);
    logAuditEvent('Updated System Settings', 'Settings', 'Modified organization information or system policies.');
    showToast('success', 'Settings Saved', 'Organization and system settings updated.');
  };

  const exportStateSnapshot = (): StorageSnapshot => {
    return storageService.createFullSnapshot();
  };

  const restoreStateSnapshot = (snapshot: StorageSnapshot) => {
    const res = storageService.restoreFromSnapshot(snapshot);
    if (res.success) {
      setSettings(storageService.loadSettings());
      setMembers(storageService.loadMembers());
      setEvents(storageService.loadEvents());
      setRegistrations(storageService.loadRegistrations());
      setAttendanceSessions(storageService.loadAttendanceSessions());
      setAttendanceRecords(storageService.loadAttendanceRecords());
      setProjects(storageService.loadProjects());
      setActivities(storageService.loadActivities());
      setAnnouncements(storageService.loadAnnouncements());
      setGallery(storageService.loadGallery());
      setOfficials(storageService.loadOfficials());
      setCertificates(storageService.loadCertificates());
      setNotifications(storageService.loadNotifications());
      setAuditLogs(storageService.loadAuditLogs());
      showToast('success', 'Snapshot Restored', res.message);
    } else {
      showToast('error', 'Restore Failed', res.message);
    }
    return res;
  };

  const getStorageMetrics = () => {
    return storageService.getStorageMetrics();
  };

  const resetToDefaults = () => {
    storageService.resetAllToFactoryDefaults();
    setSettings(INITIAL_SETTINGS);
    setMembers(INITIAL_MEMBERS);
    setEvents(INITIAL_EVENTS);
    setAttendanceSessions(INITIAL_SESSIONS);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setProjects(INITIAL_PROJECTS);
    setActivities(INITIAL_ACTIVITIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setGallery(INITIAL_GALLERY);
    setOfficials(INITIAL_OFFICIALS);
    setCertificates(INITIAL_CERTIFICATES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentRole('SUPER_ADMIN');
    setCurrentUser(INITIAL_USERS[0]);
    showToast('info', 'Reset Complete', 'Application data reset to default demo state.');
  };

  // Member Management
  const addMember = (data: Omit<Member, 'id' | 'memberId' | 'membershipDate' | 'stats'>): Member => {
    const nextNum = members.length + 43;
    const memberId = `PAGASA-2026-${String(nextNum).padStart(4, '0')}`;
    const newMember: Member = {
      ...data,
      id: 'mem-' + Date.now(),
      memberId,
      membershipDate: new Date().toISOString().split('T')[0],
      membershipStatus: data.membershipStatus || (settings.registrationAutoApproval ? 'Active' : 'Pending'),
      stats: {
        eventsJoined: 0,
        totalAttendance: 0,
        attendanceRate: 100,
        volunteerHours: 0,
        projectsParticipated: 0,
        certificatesEarned: 0
      }
    };
    setMembers(prev => [newMember, ...prev]);
    logAuditEvent('Registered New Member', 'Members', `Added member: ${newMember.fullName} (${memberId}).`);
    addNotification('New Member Application', `${newMember.fullName} from Brgy. ${newMember.barangay} registered.`, 'system');
    showToast('success', 'Registration Completed', `Member ${newMember.fullName} profile created with ID ${memberId}.`);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, ...updates };
      }
      return m;
    }));
    if (currentUser && (currentUser.id === id || currentUser.memberId === updates.memberId || (updates.email && currentUser.email.toLowerCase() === currentUser.email.toLowerCase()))) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedUser = {
          ...prev,
          ...(updates.fullName ? { name: updates.fullName } : {}),
          ...(updates.profilePicture ? { avatar: updates.profilePicture } : {})
        };
        storageService.saveUserSession(updatedUser, currentRole);
        return updatedUser;
      });
    }
    const target = members.find(m => m.id === id);
    logAuditEvent('Updated Member Profile', 'Members', `Updated profile of ${target?.fullName || id}.`);
    showToast('success', 'Member Updated', 'Member details saved successfully.');
  };

  const updateMemberStatus = (id: string, status: MembershipStatus) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, membershipStatus: status };
      }
      return m;
    }));
    const target = members.find(m => m.id === id);
    logAuditEvent(`Changed Member Status to ${status}`, 'Members', `Set status of ${target?.fullName} (${target?.memberId}) to ${status}.`);
    showToast('success', 'Status Updated', `${target?.fullName || 'Member'} status is now ${status}.`);
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    logAuditEvent('Deleted Member Record', 'Members', `Removed member ${target?.fullName} (${target?.memberId}).`);
    showToast('info', 'Member Deleted', 'Member has been removed from registry.');
  };

  // Event Management
  const addEvent = (eventData: Omit<EventItem, 'id' | 'currentParticipants' | 'createdAt'>): EventItem => {
    const newEvent: EventItem = {
      ...eventData,
      id: 'evt-' + Date.now(),
      currentParticipants: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEvents(prev => [newEvent, ...prev]);
    logAuditEvent('Created Event', 'Events', `Created new event: "${newEvent.title}".`);
    addNotification('New Event Posted', `Check out the newly announced event: ${newEvent.title}`, 'event');
    showToast('success', 'Event Created', `"${newEvent.title}" has been created.`);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, ...updates };
      }
      return e;
    }));
    const target = events.find(e => e.id === id);
    logAuditEvent('Updated Event Details', 'Events', `Modified event: "${target?.title || id}".`);
    showToast('success', 'Event Updated', 'Event changes have been saved.');
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    logAuditEvent('Deleted Event', 'Events', `Removed event: "${target?.title}".`);
    showToast('info', 'Event Removed', 'Event has been deleted.');
  };

  const isMemberRegisteredForEvent = (eventId: string, memberId: string) => {
    return registrations.some(r => r.eventId === eventId && r.memberId === memberId && r.status === 'Registered');
  };

  const registerForEvent = (eventId: string, memberInfo: { memberId: string; name: string; email: string }) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found.' };

    if (!targetEvent.registrationEnabled) {
      return { success: false, message: 'Registration is currently disabled for this event.' };
    }

    if (targetEvent.currentParticipants >= targetEvent.maxParticipants) {
      return { success: false, message: 'Event has reached maximum participant capacity.' };
    }

    // Check duplicate
    const exists = registrations.some(r => r.eventId === eventId && r.memberId === memberInfo.memberId && r.status === 'Registered');
    if (exists) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    const newReg: EventRegistration = {
      id: 'reg-' + Date.now(),
      eventId,
      memberId: memberInfo.memberId,
      memberName: memberInfo.name,
      memberEmail: memberInfo.email,
      registeredAt: new Date().toLocaleString(),
      status: 'Registered'
    };

    setRegistrations(prev => [...prev, newReg]);

    const updatedEventCount = targetEvent.currentParticipants + 1;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, currentParticipants: updatedEventCount } : e));
    
    // Update member stats
    setMembers(prev => prev.map(m => {
      if (m.memberId === memberInfo.memberId) {
        return {
          ...m,
          stats: { ...m.stats, eventsJoined: m.stats.eventsJoined + 1 }
        };
      }
      return m;
    }));

    addNotification('Registration Confirmed', `You successfully registered for "${targetEvent.title}".`, 'event');
    showToast('success', 'Registration Confirmed', `You are registered for "${targetEvent.title}".`);
    return { success: true, message: 'Successfully registered for event!' };
  };

  const cancelEventRegistration = (eventId: string, memberId: string) => {
    setRegistrations(prev => prev.filter(r => !(r.eventId === eventId && r.memberId === memberId)));
    
    const targetEvent = events.find(e => e.id === eventId);
    if (targetEvent) {
      const updatedCount = Math.max(0, targetEvent.currentParticipants - 1);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, currentParticipants: updatedCount } : e));
    }
    showToast('info', 'Registration Cancelled', 'Your registration has been cancelled.');
  };

  // Attendance Engine & Sessions
  const createAttendanceSession = (eventId: string, startTime: string, endTime: string, location: string): AttendanceSession => {
    const event = events.find(e => e.id === eventId);
    const newSession: AttendanceSession = {
      id: 'ses-' + Date.now(),
      eventId,
      eventTitle: event ? event.title : 'Organization Activity',
      date: event ? event.date : new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      location,
      isOpen: true,
      qrCodeValue: `PAGASA-ATTEND-${eventId}-${Date.now().toString(36).toUpperCase()}`,
      totalRegistered: event ? event.currentParticipants || 1 : 1,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      excusedCount: 0,
      attendanceRate: 0,
      createdAt: new Date().toISOString()
    };
    setAttendanceSessions(prev => [newSession, ...prev]);
    logAuditEvent('Opened Attendance Session', 'Attendance', `Created live attendance session for "${newSession.eventTitle}".`);
    showToast('success', 'Session Created', `Live attendance session opened for ${newSession.eventTitle}.`);
    return newSession;
  };

  const toggleAttendanceSession = (sessionId: string, isOpen: boolean) => {
    setAttendanceSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, isOpen };
      }
      return s;
    }));
    const target = attendanceSessions.find(s => s.id === sessionId);
    logAuditEvent(`${isOpen ? 'Opened' : 'Closed'} Attendance Session`, 'Attendance', `Session for "${target?.eventTitle}" is now ${isOpen ? 'OPEN' : 'CLOSED'}.`);
    showToast('info', 'Session Updated', `Attendance session is now ${isOpen ? 'OPEN' : 'CLOSED'}.`);
  };

  const recordAttendance = (
    sessionId: string,
    memberIdentifier: string,
    method: 'QR_SCAN' | 'MANUAL' | 'SEARCH',
    statusOverride?: AttendanceStatus,
    remarks?: string
  ): { success: boolean; message: string; record?: AttendanceRecord; isDuplicate?: boolean } => {
    const session = attendanceSessions.find(s => s.id === sessionId);
    if (!session) return { success: false, message: 'Attendance session not found.' };
    if (!session.isOpen) return { success: false, message: 'This attendance session is currently closed.' };

    const member = members.find(m => 
      m.memberId.toLowerCase() === memberIdentifier.trim().toLowerCase() ||
      m.id === memberIdentifier ||
      m.fullName.toLowerCase() === memberIdentifier.trim().toLowerCase() ||
      memberIdentifier.includes(m.memberId)
    );

    if (!member) {
      return { success: false, message: `Member not found for "${memberIdentifier}". Please verify Member ID.` };
    }

    const existingRecord = attendanceRecords.find(r => r.sessionId === sessionId && r.memberId === member.memberId);
    if (existingRecord) {
      return {
        success: false,
        isDuplicate: true,
        message: `⚠ Already Checked In at ${existingRecord.checkInTime} (Status: ${existingRecord.status})`,
        record: existingRecord
      };
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalStatus: AttendanceStatus = statusOverride || 'Present';

    const newRecord: AttendanceRecord = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sessionId,
      eventId: session.eventId,
      eventTitle: session.eventTitle,
      memberId: member.memberId,
      memberName: member.fullName,
      memberBarangay: member.barangay,
      checkInTime: timeString,
      date: session.date,
      status: finalStatus,
      method,
      recordedBy: currentUser ? currentUser.name : 'System QR Scanner',
      remarks
    };

    const updatedRecords = [newRecord, ...attendanceRecords];
    setAttendanceRecords(updatedRecords);

    // Recalculate session metrics
    const sessionRecords = updatedRecords.filter(r => r.sessionId === sessionId);
    const present = sessionRecords.filter(r => r.status === 'Present').length;
    const late = sessionRecords.filter(r => r.status === 'Late').length;
    const absent = sessionRecords.filter(r => r.status === 'Absent').length;
    const excused = sessionRecords.filter(r => r.status === 'Excused').length;
    const totalAttended = present + late;
    const rate = session.totalRegistered > 0 ? Number(((totalAttended / session.totalRegistered) * 100).toFixed(1)) : 100;

    const updatedSession: AttendanceSession = {
      ...session,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      excusedCount: excused,
      attendanceRate: rate
    };

    setAttendanceSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

    // Update member stats
    setMembers(prev => prev.map(m => {
      if (m.memberId === member.memberId) {
        return {
          ...m,
          stats: {
            ...m.stats,
            totalAttendance: m.stats.totalAttendance + 1,
            volunteerHours: m.stats.volunteerHours + 4,
            attendanceRate: Number((((m.stats.totalAttendance + 1) / Math.max(1, m.stats.eventsJoined || 1)) * 100).toFixed(1))
          }
        };
      }
      return m;
    }));

    logAuditEvent('Recorded Attendance', 'Attendance', `Marked ${member.fullName} (${member.memberId}) as ${finalStatus} for "${session.eventTitle}".`);
    addNotification('Attendance Recorded', `Your attendance for "${session.eventTitle}" was logged at ${timeString} (${finalStatus}).`, 'attendance');

    return {
      success: true,
      message: `✓ Attendance Recorded Successfully (${timeString})`,
      record: newRecord
    };
  };

  const updateAttendanceRecordStatus = (recordId: string, status: AttendanceStatus, remarks?: string) => {
    setAttendanceRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return { ...r, status, remarks: remarks !== undefined ? remarks : r.remarks };
      }
      return r;
    }));
    logAuditEvent('Corrected Attendance Record', 'Attendance', `Updated attendance record #${recordId} to ${status}.`);
    showToast('success', 'Attendance Updated', `Record updated to ${status}.`);
  };

  const deleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    logAuditEvent('Deleted Attendance Record', 'Attendance', `Removed attendance record #${recordId}.`);
    showToast('info', 'Record Removed', 'Attendance entry removed.');
  };

  // Projects
  const addProject = (data: Omit<ProjectItem, 'id'>) => {
    const newProject: ProjectItem = { ...data, id: 'prj-' + Date.now() };
    setProjects(prev => [newProject, ...prev]);
    logAuditEvent('Added New Project', 'Projects', `Created project: "${newProject.title}".`);
    showToast('success', 'Project Added', `"${newProject.title}" has been added.`);
  };

  const updateProject = (id: string, updates: Partial<ProjectItem>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    }));
    showToast('success', 'Project Updated', 'Project changes saved.');
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('info', 'Project Deleted', 'Project has been removed.');
  };

  // Activities
  const addActivity = (data: Omit<ActivityItem, 'id'>) => {
    const newAct: ActivityItem = { ...data, id: 'act-' + Date.now() };
    setActivities(prev => [newAct, ...prev]);
    logAuditEvent('Created Activity', 'Activities', `Added activity: "${newAct.title}".`);
    showToast('success', 'Activity Created', `"${newAct.title}" added to schedule.`);
  };

  const updateActivity = (id: string, updates: Partial<ActivityItem>) => {
    setActivities(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      return a;
    }));
    showToast('success', 'Activity Updated', 'Activity saved.');
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    showToast('info', 'Activity Removed', 'Activity deleted.');
  };

  // Announcements
  const addAnnouncement = (data: Omit<AnnouncementItem, 'id' | 'views'>) => {
    const newAnn: AnnouncementItem = { ...data, id: 'ann-' + Date.now(), views: 1 };
    setAnnouncements(prev => [newAnn, ...prev]);
    logAuditEvent('Published Announcement', 'Announcements', `Created announcement: "${newAnn.title}".`);
    addNotification('New Announcement', newAnn.title, 'announcement');
    showToast('success', 'Announcement Published', `"${newAnn.title}" is now live.`);
  };

  const updateAnnouncement = (id: string, updates: Partial<AnnouncementItem>) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      return a;
    }));
    showToast('success', 'Announcement Updated', 'Announcement saved.');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast('info', 'Announcement Deleted', 'Announcement removed.');
  };

  // Gallery
  const addGalleryPhoto = (data: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = { ...data, id: 'gal-' + Date.now() };
    setGallery(prev => [newPhoto, ...prev]);
    logAuditEvent('Uploaded Gallery Photo', 'Gallery', `Added image: "${newPhoto.title}".`);
    showToast('success', 'Photo Added', 'Image uploaded to photo gallery.');
  };

  const deleteGalleryPhoto = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    showToast('info', 'Photo Removed', 'Gallery item deleted.');
  };

  // Officials
  const addOfficial = (data: Omit<OfficialItem, 'id'>) => {
    const newOfficial: OfficialItem = { ...data, id: 'off-' + Date.now() };
    const updated = [...officials, newOfficial].sort((a, b) => (a.rank || 1) - (b.rank || 1));
    setOfficials(updated);
    logAuditEvent('Added Organization Official', 'Officials', `Added ${newOfficial.fullName} (${newOfficial.position}).`);
    showToast('success', 'Official Added', `${newOfficial.fullName} added to officials roster.`);
  };

  const updateOfficial = (id: string, updates: Partial<OfficialItem>) => {
    const updated = officials.map(o => {
      if (o.id === id) {
        return { ...o, ...updates };
      }
      return o;
    }).sort((a, b) => (a.rank || 1) - (b.rank || 1));
    setOfficials(updated);
    showToast('success', 'Official Updated', 'Official information saved.');
  };

  const deleteOfficial = (id: string) => {
    setOfficials(prev => prev.filter(o => o.id !== id));
    showToast('info', 'Official Removed', 'Official removed from roster.');
  };

  // Certificates
  const issueCertificate = (data: Omit<CertificateItem, 'id' | 'certificateNumber' | 'qrVerificationUrl'>): CertificateItem => {
    const certNum = `CERT-PAGASA-2026-${String(certificates.length + 1).padStart(4, '0')}`;
    const newCert: CertificateItem = {
      ...data,
      id: 'cert-' + Date.now(),
      certificateNumber: certNum,
      qrVerificationUrl: `https://pagasaguimba.org/verify/${certNum}`
    };
    setCertificates(prev => [newCert, ...prev]);
    
    // Update member certificate count
    setMembers(prev => prev.map(m => {
      if (m.memberId === data.memberId) {
        return {
          ...m,
          stats: { ...m.stats, certificatesEarned: m.stats.certificatesEarned + 1 }
        };
      }
      return m;
    }));

    logAuditEvent('Issued Official Certificate', 'Certificates', `Issued certificate ${certNum} to ${data.memberName} for "${data.eventOrActivityTitle}".`);
    addNotification('Certificate Generated', `Your certificate for "${data.eventOrActivityTitle}" is ready to view & download.`, 'certificate');
    showToast('success', 'Certificate Issued', `Certificate ${certNum} generated for ${data.memberName}.`);
    return newCert;
  };

  const deleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
    showToast('info', 'Certificate Deleted', 'Certificate record deleted.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentMember,
        currentRole,
        currentPage,
        selectedEventId,
        selectedMemberId,
        activeCertificate,
        isAuthModalOpen,
        authModalMode,
        isGlobalSearchOpen,
        toasts,
        theme,
        effectiveTheme,
        colorPalette,
        setTheme,
        toggleTheme,
        setColorPalette,
        setCurrentPage,
        setSelectedEventId,
        setSelectedMemberId,
        setActiveCertificate,
        setIsAuthModalOpen,
        setAuthModalMode,
        setIsGlobalSearchOpen,
        switchRole,
        loginUser,
        loginWithSupabase,
        signUpWithSupabase,
        resetUserPassword,
        loginWithGoogle,
        logoutUser,
        isSupabaseConfigured,
        updateCurrentUser,
        updateUserProfilePicture,
        showToast,
        addToast,
        removeToast,
        settings,
        updateSettings,
        resetToDefaults,
        exportStateSnapshot,
        restoreStateSnapshot,
        getStorageMetrics,
        members,
        addMember,
        updateMember,
        updateMemberStatus,
        deleteMember,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        cancelEventRegistration,
        isMemberRegisteredForEvent,
        registrations,
        attendanceSessions,
        attendanceRecords,
        createAttendanceSession,
        toggleAttendanceSession,
        recordAttendance,
        updateAttendanceRecordStatus,
        deleteAttendanceRecord,
        projects,
        addProject,
        updateProject,
        deleteProject,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        gallery,
        addGalleryPhoto,
        deleteGalleryPhoto,
        officials,
        addOfficial,
        updateOfficial,
        deleteOfficial,
        certificates,
        issueCertificate,
        deleteCertificate,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        auditLogs,
        logAuditEvent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
