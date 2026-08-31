import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  activeNav?: NavKey;
  onNavigate?: (key: NavKey) => void;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  user?: { name: string; role: string; initials: string };
}

export type NavKey = 'dashboard' | 'equipment' | 'sites' | 'departments' | 'requests' | 'preventive' | 'users' | 'analytics';
export type Language = 'FR' | 'AR' | 'EN';

const NAV_ITEMS: { key: NavKey; labels: Record<Language, string>; icon: ReactElement }[] = [
  { key: 'dashboard', labels: { FR: 'Tableau de bord', EN: 'Dashboard', AR: 'لوحة القيادة' }, icon: <IconGrid /> },
  { key: 'equipment', labels: { FR: 'Équipements', EN: 'Equipment', AR: 'المعدات' }, icon: <IconBox /> },
  { key: 'sites', labels: { FR: 'Sites', EN: 'Sites', AR: 'المواقع' }, icon: <IconBox /> },
  { key: 'departments', labels: { FR: 'Départements', EN: 'Departments', AR: 'الأقسام' }, icon: <IconBox /> },
  { key: 'requests', labels: { FR: 'Demandes maintenance', EN: 'Maintenance requests', AR: 'طلبات الصيانة' }, icon: <IconWrench /> },
  { key: 'analytics', labels: { FR: 'Analytique', EN: 'Analytics', AR: 'التحليلات' }, icon: <IconChart /> },
];

const LANGS: Language[] = ['FR', 'AR', 'EN'];

export function Layout({
  children,
  activeNav = 'dashboard',
  onNavigate,
  language = 'FR',
  onLanguageChange,
  user = { name: 'Utilisateur', role: 'Compte COPAG', initials: 'U' },
}: LayoutProps) {
  const [lang, setLang] = useState<Language>(language);

  function changeLanguage(nextLanguage: Language) {
    setLang(nextLanguage);
    onLanguageChange?.(nextLanguage);
  }

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
          {NAV_ITEMS.map((item) => (
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

          <div className="user-chip">
            <div className="user-avatar">{user.initials}</div>
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
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