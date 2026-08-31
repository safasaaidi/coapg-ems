import { useState, useEffect } from 'react';
import type { Status, Priority } from '../types/maintenance.types';
import '../styles/RequestDetailsModal.css';

export interface RequestDetail {
  id: string;
  title: string;
  equipment: string;
  category: string;
  priority: Priority;
  status: Status;
  description: string;
  assignedTo: string | null;
  createdAt: string;
  createdBy: string;
  attachmentUrl?: string | null;
  onOpenAssign?: (id: string) => void;
onOpenIntervention?: (id: string) => void;
}

interface RequestDetailsModalProps {
  requestId: string | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
  fetchDetailApi?: (id: string) => Promise<RequestDetail>;
  updateStatusApi?: (id: string, status: Status, assignedTo?: string) => Promise<void>;
}

const TECHNICIANS = [
  'Youssef A.',
  'Hassan M.',
  'Kharbouch A.',
  'Ali Karimi',
  'Saïd Nasser',
];

const ALL_STATUSES: { key: Status; label: string }[] = [
  { key: 'Nouveau', label: 'Nouveau' },
  { key: 'Qualifie', label: 'Qualifié' },
  { key: 'Affecte', label: 'Affecté' },
  { key: 'EnCours', label: 'En cours' },
  { key: 'EnAttente', label: 'En attente' },
  { key: 'Resolu', label: 'Résolu' },
  { key: 'Cloture', label: 'Clôturé' },
];

export function RequestDetailsModal({
  requestId,
  onClose,
  onStatusUpdated,
  fetchDetailApi,
  updateStatusApi,
}: RequestDetailsModalProps) {
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [selectedStatus, setSelectedStatus] = useState<Status>('Nouveau');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  useEffect(() => {
    if (!requestId) return;

    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        if (fetchDetailApi) {
          const data = await fetchDetailApi(requestId!);
          setRequest(data);
          setSelectedStatus(data.status);
          setSelectedTechnician(data.assignedTo || '');
        } else {
          const res = await fetch(`/api/maintenance-requests/${requestId}`);
          if (!res.ok) throw new Error('Impossible de charger les détails de la demande.');
          const data: RequestDetail = await res.json();
          setRequest(data);
          setSelectedStatus(data.status);
          setSelectedTechnician(data.assignedTo || '');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des détails.');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [requestId, fetchDetailApi]);

  const handleUpdate = async () => {
    if (!requestId || !request) return;

    setIsUpdating(true);
    setError(null);
    try {
      if (updateStatusApi) {
        await updateStatusApi(requestId, selectedStatus, selectedTechnician || undefined);
      } else {
        const res = await fetch(`/api/maintenance-requests/${requestId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: selectedStatus,
            assignedTo: selectedTechnician || null,
          }),
        });
        if (!res.ok) throw new Error('Échec de la mise à jour du ticket.');
      }

      onStatusUpdated?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityClass = (priority?: Priority) => {
    switch (priority) {
      case 'Critique': return 'priority-critique';
      case 'Elevee': return 'priority-elevee';
      case 'Moyenne': return 'priority-moyenne';
      case 'Faible': return 'priority-faible';
      default: return '';
    }
  };

  if (!requestId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* En-tête */}
        <div className="modal-header">
          <div>
            <span className="modal-header-tag">Ticket {requestId}</span>
            <h2 className="modal-header-title">
              {request ? request.title : 'Détails de la demande'}
            </h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Fermer la modale"
          >
            ✕
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Etat de chargement */}
        {loading ? (
          <div className="loading-state">
            Chargement des détails...
          </div>
        ) : request ? (
          <>
            {/* Grille des caractéristiques */}
            <div className="details-grid">
              <div>
                <span className="details-item-label">Équipement</span>
                <span className="details-item-value">{request.equipment}</span>
              </div>
              <div>
                <span className="details-item-label">Catégorie</span>
                <span className="details-item-value">{request.category}</span>
              </div>
              <div>
                <span className="details-item-label">Priorité</span>
                <span className={`details-item-value ${getPriorityClass(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              <div>
                <span className="details-item-label">Date de Création</span>
                <span className="details-item-value">{request.createdAt}</span>
              </div>
            </div>

            {/* Description */}
            <div className="details-section">
              <span className="details-section-title">Description de l'incident</span>
              <div className="details-description-box">
                {request.description || 'Aucune description fournie.'}
              </div>
            </div>

            {/* Pièce jointe */}
            {request.attachmentUrl && (
              <div className="details-section">
                <span className="details-section-title">Pièce jointe</span>
                <a
                  href={request.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  📎 Voir le document joint
                </a>
              </div>
            )}

            {/* Formulaire de mise à jour (Statut & Technicien) */}
            <div className="modal-actions-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="select-status">
                  Statut du ticket
                </label>
                <select
                  id="select-status"
                  className="field-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Status)}
                  disabled={isUpdating}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="select-technician">
                  Affecter à un technicien
                </label>
                <select
                  id="select-technician"
                  className="field-select"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Non assigné</option>
                  {TECHNICIANS.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pied de la modale */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isUpdating}
              >
                Fermer
              </button>
              <button type="button" className="btn-secondary" onClick={() => onOpenAssign?.(requestId!)}>
  Affecter un technicien
</button>
<button type="button" className="btn-secondary" onClick={() => onOpenIntervention?.(requestId!)}>
  Saisir une intervention
</button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Enregistrement...' : 'Mettre à jour'}
              </button>
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
}