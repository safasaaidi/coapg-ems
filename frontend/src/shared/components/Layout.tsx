import { useState, useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { authService } from "../../features/auth/api/authService";
import './Layout.css';

export type NavKey = 'dashboard' | 'equipment' | 'sites' | 'departments' | 'requests' | 'preventive' | 'users' | 'analytics';
export type Language = 'FR' | 'AR' | 'EN';

interface LayoutProps {
  children: ReactNode;
  activeNav?: NavKey;
  onNavigate?: (key: NavKey) => void;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  user?: { name: string; role: string; initials: string; email?: string };
  onLogout?: () => void;
}

// Dans Layout.tsx, adaptez les rôles autorisés :

const NAV_ITEMS = [
  { 
    key: 'dashboard', 
    labels: { FR: 'Tableau de bord', EN: 'Dashboard', AR: 'لوحة القيادة' }, 
    icon: <IconGrid />,
    allowedRoles: ['Demandeur', 'Technician', 'Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'requests', 
    labels: { FR: 'Demandes maintenance', EN: 'Maintenance requests', AR: 'طلبات الصيانة' }, 
    icon: <IconWrench />,
    allowedRoles: ['Demandeur', 'Technician', 'Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'equipment', 
    labels: { FR: 'Équipements', EN: 'Equipment', AR: 'المعدات' }, 
    icon: <IconBox />,
    allowedRoles: ['Technician', 'Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'preventive', 
    labels: { FR: 'Planning Préventif', EN: 'Preventive Planning', AR: 'الجدول الوقائي' }, 
    icon: <IconGrid />,
    allowedRoles: ['Technician', 'Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'sites', 
    labels: { FR: 'Sites', EN: 'Sites', AR: 'المواقع' }, 
    icon: <IconBox />,
    allowedRoles: ['Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'departments', 
    labels: { FR: 'Départements', EN: 'Departments', AR: 'الأقسام' }, 
    icon: <IconBox />,
    allowedRoles: ['Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'users', 
    labels: { FR: 'Utilisateurs', EN: 'Users', AR: 'المستخدمين' }, 
    icon: <IconGrid />,
    allowedRoles: ['Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
  { 
    key: 'analytics', 
    labels: { FR: 'Analytique', EN: 'Analytics', AR: 'التحليلات' }, 
    icon: <IconChart />,
    allowedRoles: ['Supervisor', 'admin', 'ResponsableMaintenance', 'Admin'] 
  },
];

const LANGS: Language[] = ['FR', 'AR', 'EN'];

export function Layout({
  children,
  activeNav = 'dashboard',
  onNavigate,
  language = 'FR',
  onLanguageChange,
  user: customUser,
  onLogout,
}: LayoutProps) {
  const [lang, setLang] = useState<Language>(language);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // État pour gérer l'ouverture/fermeture du menu profil
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customUser) {
      setCurrentUser(customUser);
    } else {
      const authUser = authService.getCurrentUser();
      setCurrentUser(authUser);
    }
  }, [customUser]);

  // Fermer le dropdown lorsqu'on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLang(nextLanguage);
    onLanguageChange?.(nextLanguage);
  }

  // Informations utilisateur dynamiques
  const displayName = currentUser?.fullName || currentUser?.name || 'Utilisateur';
  const displayRole = currentUser?.role || localStorage.getItem('userRole') || 'Compte COPAG';
  const displayEmail = currentUser?.email || 'Non renseigné';
  const avatarUrl = currentUser?.avatarUrl || currentUser?.photo;

  const displayInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(displayRole)
  );

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">CE</span>
          <div>
            <div className="sidebar-brand-name">COPAG EMS</div>
            <div className="sidebar-brand-tag">Gestion de la Maintenance</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-nav-item${activeNav === item.key ? ' active' : ''}`}
              onClick={() => onNavigate?.(item.key)}
            >
              {item.icon}
              <span>{item.labels[lang]}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>COPAG EMS v1.0</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-spacer" />

          <div className="lang-switch">
            {LANGS.map((l) => (
              <button
                key={l}
                className={l === lang ? 'active' : ''}
                onClick={() => changeLanguage(l)}
              >
                {l}
              </button>
            ))}
          </div>

          <button className="icon-button" aria-label="Notifications">
            <IconBell />
          </button>

          {/* CHIP UTILISATEUR ET DROPDOWN MENU */}
          <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              className="user-chip" 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="user-avatar" style={{ overflow: 'hidden', borderRadius: '50%' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  displayInitials
                )}
              </div>
              <div className="user-meta">
                <div className="user-name">{displayName}</div>
                <div className="user-role">{displayRole}</div>
              </div>
            </div>

            {/* MODALE DROPDOWN DU PROFIL */}
            {isProfileOpen && (
              <div 
                className="profile-dropdown shadow-lg rounded-xl border bg-white p-4"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '280px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  zIndex: 100,
                  color: '#1e293b'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                    {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : displayInitials}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>{displayName}</h4>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500 }}>{displayRole}</span>
                  </div>
                </div>

                <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Adresse E-mail</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 500 }}>{displayEmail}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Entité</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 500 }}>COPAG EMS</p>
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={handleLogoutClick}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '8px',
                      fontSize: '13px'
                    }}
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 8.5V16l9 4.5 9-4.5V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 13v7.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.7 2.7-2.4-2.4 2.7-2.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9a6 6 0 1 1 12 0c0 4.2 1.2 5.6 1.2 5.6H4.8S6 13.2 6 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}