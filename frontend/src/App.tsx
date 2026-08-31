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
import { UsersPage } from './features/administration/UsersPage'; // Import de la page Utilisateurs
import { PreventivePlanningPage } from "./features/preventive/Preventiveplanningpage";// Import du Planning Préventif
import { authService } from './features/auth/api/authService';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('authToken'),
  );
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard');
  const [language, setLanguage] = useState<'FR' | 'AR' | 'EN'>('FR');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Récupération du rôle de l'utilisateur connecté
  const userRole = authService.getCurrentUser()?.role || localStorage.getItem('userRole');
  const isAdminOrManager = userRole === 'Admin' || userRole === 'ResponsableMaintenance';

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout 
      activeNav={activeNav} 
      onNavigate={(nav) => {
        // Réinitialise l'équipement sélectionné lors d'un changement d'onglet
        setSelectedEquipmentId(null);
        setActiveNav(nav);
      }} 
      language={language} 
      onLanguageChange={setLanguage}
    >
      {activeNav === 'dashboard' && <DashboardPage />}

      {activeNav === 'equipment' && (
        selectedEquipmentId
          ? <EquipmentDetailPage id={selectedEquipmentId} onBack={() => setSelectedEquipmentId(null)} />
          : <EquipmentsList onSelect={(id) => setSelectedEquipmentId(id)} />
      )}

      {activeNav === 'sites' && <SitesPage language={language} />}
      
      {activeNav === 'departments' && <DepartmentsPage language={language} />}
      
      {activeNav === 'requests' && <MaintenancePage />}

      {/* Onglet Planning Préventif */}
      {activeNav === 'preventive' && <PreventivePlanningPage />}

      {/* Onglet Utilisateurs (Accès Restreint) */}
      {activeNav === 'users' && (
        isAdminOrManager ? (
          <UsersPage />
        ) : (
          <div className="p-8 text-center bg-white rounded-lg border shadow-sm my-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
            <p className="text-gray-600 text-sm">
              Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs.
            </p>
          </div>
        )
      )}

      {activeNav === 'analytics' && <p className="p-6">Analytique — écran à venir.</p>}
    </Layout>
  );
}

export default App;