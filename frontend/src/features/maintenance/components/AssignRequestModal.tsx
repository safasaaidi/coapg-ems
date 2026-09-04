import { useState, useEffect } from 'react';
import '../styles/QualifyRequestModal.css';
import { maintenanceService } from '../api/maintenanceService';
import api from '../../../services/api';
import type { RequestDetail } from '../types/maintenance.types';
// En haut de CreateMaintenanceRequestModal.tsx
import { equipmentService } from "../../../services/equipmentService";
// (Ajustez le chemin relatif selon la structure exacte de vos dossiers d'équipements)
type MaintenanceType = 'Corrective' | 'Preventive' | 'Amelioration' | 'Inspection';

interface Technician {
  id: string;
  name: string;
  specialty: string;
  tasks: number;
  available: boolean;
}

interface AssignRequestModalProps {
  isOpen: boolean;
  requestId: string;
  onClose: () => void;
  onAssigned?: () => void;
}

const TYPES: { key: MaintenanceType; label: string }[] = [
  { key: 'Corrective', label: 'Corrective' },
  { key: 'Preventive', label: 'Préventive' },
  { key: 'Amelioration', label: 'Améliorative' },
  { key: 'Inspection', label: 'Inspection' },
];

export function AssignRequestModal({
  isOpen,
  requestId,
  onClose,
  onAssigned,
}: AssignRequestModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [incident, setIncident] = useState<RequestDetail | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [type, setType] = useState<MaintenanceType>('Corrective'); // UI uniquement pour l'instant, voir note ci-dessous
  const [technicianId, setTechnicianId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [instructions, setInstructions] = useState<string>(''); // UI uniquement pour l'instant

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    maintenanceService.getRequestById(requestId).then(setIncident);
    api.get('/users').then((res) => {
      const techs = res.data
        .filter((u: any) => u.role === 'Technician')
        .map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, specialty: '', tasks: 0, available: true }));
      setTechnicians(techs);
    });
  }, [isOpen, requestId]);

  if (!isOpen || !incident) return null;

  const selectedTechnician = technicians.find((t) => t.id === technicianId);

  async function handleAssign() {
    setErrorMessage(null);
    if (!technicianId || !scheduledDate) {
      setErrorMessage('Veuillez sélectionner un technicien et une date.');
      return;
    }

    setIsSubmitting(true);
    try {
      // NOTE : "type" et "instructions" sont capturés dans l'UI mais pas encore acceptés
      // par AssignWorkOrderRequest côté backend — à ajouter si ce besoin est confirmé.
      await maintenanceService.assignTechnician(requestId, {
        technicianId,
        dueDate: scheduledDate,
      });
      onAssigned?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Une erreur est survenue lors de la qualification.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container qualification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting} aria-label="Fermer">&times;</button>

        <div className="qualification-page">
          <div className="incident-summary">
            <div className="incident-summary-header">
              <span className="warn-icon">⚠</span>
              <h1>Résumé de l'Incident Signalé</h1>
              <span className="pill-pending">{incident.status}</span>
            </div>
            <div className="incident-summary-grid">
              <div>
                <span className="summary-label">Équipement</span>
                <div className="summary-value">{incident.equipmentName}</div>
              </div>
              <div>
                <span className="summary-label">Description</span>
                <div className="summary-value">{incident.title}</div>
              </div>
              <div>
                <span className="summary-label">Déclarée le</span>
                <div className="summary-value">{new Date(incident.reportedAt).toLocaleDateString('fr-FR')}</div>
                <div className="summary-sub">par {incident.requesterName}</div>
              </div>
            </div>
          </div>

          <div className="qualification-form">
            <h2>Formulaire de Qualification</h2>
            {errorMessage && <div className="form-error-alert">{errorMessage}</div>}

            <div className="field">
              <label>Type de Maintenance</label>
              <div className="type-toggle">
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    disabled={isSubmitting}
                    className={`type-btn${type === t.key ? ' active' : ''}`}
                    onClick={() => setType(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Affecter à un Technicien *</label>
              <div className="technician-list">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    disabled={isSubmitting}
                    className={`technician-card${technicianId === tech.id ? ' active' : ''}`}
                    onClick={() => setTechnicianId(tech.id)}
                  >
                    <span className="technician-avatar">
                      {tech.name.split(' ').map((p) => p[0]).join('')}
                    </span>
                    <span className="technician-info">
                      <span className="technician-name">{tech.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="scheduled-date">Date d'intervention prévue *</label>
              <input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="field">
              <label htmlFor="instructions">Instructions pour le technicien</label>
              <textarea
                id="instructions"
                rows={3}
                maxLength={500}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>Annuler</button>
              <button type="button" className="btn-primary" onClick={handleAssign} disabled={isSubmitting}>
                {isSubmitting ? 'Affectation…' : 'Valider & Affecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}