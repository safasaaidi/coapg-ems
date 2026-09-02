import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // 1. Rediriger vers le login si l'utilisateur n'est pas connecté
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si aucun rôle spécifique n'est exigé, autoriser l'accès
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // 2. Mappage de correspondance entre les rôles C# Backend et les libellés Frontend
  const roleAliases: Record<string, string[]> = {
    admin: ['admin', 'Admin', 'Direction'],
    Supervisor: ['Supervisor', 'ResponsableMaintenance', 'Responsable', 'SupervisorMaintenance'],
    Technician: ['Technician', 'Technicien'],
    Demandeur: ['Demandeur', 'Operateur', 'User']
  };

  // Récupération du rôle de l'utilisateur connecté
  const userRole = currentUser.role;

  // Vérification si le rôle de l'utilisateur correspond à l'un des rôles autorisés
  const isAuthorized = allowedRoles.some((role) => {
    // Vérification directe
    if (role.toLowerCase() === userRole?.toLowerCase()) return true;

    // Vérification via les alias
    const aliases = roleAliases[userRole] || [];
    return aliases.includes(role);
  });

  if (!isAuthorized) {
    // Si le rôle n'a pas les droits requis
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Afficher le composant protégé
  return <Outlet />;
};