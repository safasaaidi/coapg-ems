import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajustez selon votre gestion d'état auth

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth(); // Récupère l'utilisateur connecté

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalisation des rôles pour éviter les blocages dus aux majuscules/minuscules
  const userRoleNormalized = user.role?.toLowerCase();
  
  const isAuthorized = allowedRoles.some((role) => {
    const roleNormalized = role.toLowerCase();
    
    // Alias : si la route autorise "supervisor", accepter aussi "responsablemaintenance"
    if (roleNormalized === 'supervisor' && userRoleNormalized === 'responsablemaintenance') {
      return true;
    }
    
    return roleNormalized === userRoleNormalized;
  });

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ffffff' }}>
        <h2>Accès non autorisé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
      </div>
    );
  }

  return children;
}