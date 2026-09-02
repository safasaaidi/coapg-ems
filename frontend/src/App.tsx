import { useState } from 'react';
import { Layout } from './shared/components/Layout';
import type { NavKey } from './shared/components/Layout';
import { EquipmentsList } from './features/equipment/components/EquipmentsList';
import { DashboardPage } from './features/dashboard/DashboardPage';
import LoginPage from './features/auth/LoginPage';
import { SitesPage } from './features/administration/SitesPage';
import { DepartmentsPage } from './features/administration/DepartmentsPage';
import { MaintenancePage } from './features/maintenance/pages/MaintenancePage';
import { EquipmentDetailPage } from './features/equipment/components/EquipmentDetailPage';
import { UsersPage } from './features/administration/UsersPage';
import { PreventivePlanningPage } from "./features/preventive/Preventiveplanningpage";
import { authService } from './features/auth/api/authService';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('authToken'),
  );
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard');
  const [language, setLanguage] = useState<'FR' | 'AR' | 'EN'>('FR');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // 1. Récupération précise du rôle
  const userRole = authService.getCurrentUser()?.role || localStorage.getItem('userRole') || '';

  // 2. Définition des permissions par groupe de rôles
  const isAdminOrManager = userRole === 'Admin' || userRole === 'ResponsableMaintenance';
  const isTechnicianOrAbove = isAdminOrManager || userRole === 'Technician';

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Composant réutilisable pour afficher le bloc "Accès non autorisé"
  const UnauthorizedAccess = () => (
    <div className="p-8 text-center bg-white rounded-lg border shadow-sm my-6">
      <h2 className="text-xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
      <p className="text-gray-600 text-sm">
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
      </p>
    </div>
  );

  return (
    <Layout 
      activeNav={activeNav} 
      onNavigate={(nav) => {
        setSelectedEquipmentId(null);
        setActiveNav(nav);
      }} 
      language={language} 
      onLanguageChange={setLanguage}
    >
      {/* 1. Dashboard (Accessible à tous) */}
      {activeNav === 'dashboard' && <DashboardPage />}

      {/* 2. Équipements (Techniciens, Managers, Admins) */}
      {activeNav === 'equipment' && (
        isTechnicianOrAbove ? (
          selectedEquipmentId
            ? <EquipmentDetailPage id={selectedEquipmentId} onBack={() => setSelectedEquipmentId(null)} />
            : <EquipmentsList onSelect={(id) => setSelectedEquipmentId(id)} />
        ) : <UnauthorizedAccess />
      )}

      {/* 3. Demandes & Interventions (Accessible à tous, la vue interne s'adapte) */}
      {activeNav === 'requests' && <MaintenancePage />}

      {/* 4. Planning Préventif (Techniciens, Managers, Admins) */}
      {activeNav === 'preventive' && (
        isTechnicianOrAbove ? <PreventivePlanningPage /> : <UnauthorizedAccess />
      )}

      {/* 5. Sites & Départements (Administrateurs & Managers uniquement) */}
      {activeNav === 'sites' && (
        isAdminOrManager ? <SitesPage language={language} /> : <UnauthorizedAccess />
      )}
      
      {activeNav === 'departments' && (
        isAdminOrManager ? <DepartmentsPage language={language} /> : <UnauthorizedAccess />
      )}

      {/* 6. Utilisateurs (Administrateurs & Managers uniquement) */}
      {activeNav === 'users' && (
        isAdminOrManager ? <UsersPage /> : <UnauthorizedAccess />
      )}

      {/* 7. Analytique */}
      {activeNav === 'analytics' && (
        isAdminOrManager ? <p className="p-6">Analytique — écran à venir.</p> : <UnauthorizedAccess />
      )}
    </Layout>
  );
}

export default App;