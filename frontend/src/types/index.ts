// Enums & Types de base
export type Priority = 'Basse' | 'Moyenne' | 'Elevee' | 'Critique';

export type Status = 
  | 'Nouveau' 
  | 'Qualifie' 
  | 'Affecte' 
  | 'EnCours' 
  | 'EnAttente' 
  | 'Resolu' 
  | 'Cloture';

export type UserRole = 'Demandeur' | 'Technicien' | 'Responsable' | 'Admin';

// Modèle Utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Modèle Demande de Maintenance / Ordre de Travail
export interface MaintenanceRequest {
  id: string;
  title: string;
  equipment: string;
  category: string;
  priority: Priority;
  status: Status;
  description: string;
  createdBy: string;
  createdAt: string;
  assignedTo?: string | null;
  attachmentUrl?: string | null;
}

// Payload pour la création d'une nouvelle demande
export interface CreateMaintenanceRequestPayload {
  title: string;
  equipment: string;
  category: string;
  priority: Priority;
  description: string;
  attachment?: File | null;
}

// Payload pour la mise à jour d'un statut / affectation
export interface UpdateStatusPayload {
  status: Status;
  assignedTo?: string | null;
}