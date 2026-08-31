import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../../services/api';
import type { RequestDetail } from '../types/maintenance.types';
import './InterventionPage.css';

export interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

interface InterventionPageProps {
  requestDetails: RequestDetail; // vraies données, plus de DEFAULT_REQUEST fictif
  currentUserId: string;         // le technicien connecté
  onCancel?: () => void;
  onSaved?: () => void;
}

const OUTCOME_LABELS: Record<string, string> = {
  Resolu: 'Résolu / Opérationnel',
  EnAttente: 'En attente de pièce',
  NonResolu: 'Non résolu',
};

export function InterventionPage({
  requestDetails,
  currentUserId,
  onCancel,
  onSaved,
}: InterventionPageProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [actions, setActions] = useState('');
  const [downtime, setDowntime] = useState('2.5');
  const [outcome, setOutcome] = useState('Resolu');
  const [parts, setParts] = useState<SparePart[]>([
    { id: crypto.randomUUID(), name: '', quantity: 1 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function addPart() {
    setParts((prev) => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1 }]);
  }
  function updatePart(id: string, patch: Partial<SparePart>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function removePart(id: string) {
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // RG-05 : diagnostic ET actions obligatoires
    if (!diagnosis.trim() || !actions.trim()) {
      setErrorMessage('Le diagnostic et les actions réalisées sont obligatoires.');
      return;
    }

    setIsSaving(true);

    const validParts = parts
      .filter((p) => p.name.trim() !== '')
      .map((p) => ({ name: p.name.trim(), quantity: p.quantity }));

    try {
      await api.post(`/maintenance-requests/${requestDetails.id}/interventions`, {
        technicianId: currentUserId,
        diagnosticDetails: diagnosis.trim(),
        actionsTaken: actions.trim(),
        resultNotes: OUTCOME_LABELS[outcome] ?? outcome,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        downtimeMinutes: Math.round((parseFloat(downtime) || 0) * 60),
        parts: validParts,
      });
      onSaved?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Une erreur imprévue est survenue.');
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <div className="intervention-page">
      <div className="intervention-header">
        <div>
          {onCancel && (
            <button type="button" className="back-link" onClick={onCancel}>
              ← Retour aux demandes
            </button>
          )}
          <div className="intervention-title-row">
            <h1>Fiche d'Intervention Technique</h1>
            <span className="status-badge status-encours">{requestDetails.status}</span>
          </div>
          <p>Rapport de réparation — Demande #{requestDetails.requestCode}</p>
        </div>
      </div>

      <div className="intervention-info-bar">
        <InfoItem
          label="Équipement"
          value={`${requestDetails.equipmentCode} — ${requestDetails.equipmentName}`}
        />
        <InfoItem label="Incident déclaré" value={requestDetails.incidentTitle} />
        <InfoItem label="Priorité" value={requestDetails.priority} />
        <InfoItem label="Site / Localisation" value={requestDetails.location} />
        <InfoItem
          label="Demandeur"
          value={`${requestDetails.requesterName} (${requestDetails.requesterRole})`}
        />
        <InfoItem label="Date de déclaration" value={requestDetails.declaredAt} />
      </div>

      <form className="intervention-form" onSubmit={handleSubmit} noValidate>
        <h2>Rapport d'Intervention</h2>
        <p className="form-hint">Saisissez les détails de l'intervention technique réalisée ci-dessous.</p>

        {errorMessage && <div className="form-error-alert">{errorMessage}</div>}

        <div className="field">
          <label htmlFor="diagnosis">Diagnostic &amp; Cause de la Panne *</label>
          <textarea
            id="diagnosis"
            rows={3}
            placeholder="Décrivez l'origine de la panne constatée lors de l'inspection…"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={isSaving}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="actions">Actions Réalisées *</label>
          <textarea
            id="actions"
            rows={3}
            placeholder="Détaillez les réparations et réglages effectués…"
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            disabled={isSaving}
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="downtime">Temps d'Arrêt Total (heures)</label>
            <input
              id="downtime"
              type="number"
              min="0"
              step="0.5"
              value={downtime}
              onChange={(e) => setDowntime(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="field">
            <label htmlFor="outcome">Statut Après Intervention *</label>
            <select
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              disabled={isSaving}
            >
              <option value="Resolu">Résolu / Opérationnel</option>
              <option value="EnAttente">En attente de pièce</option>
              <option value="NonResolu">Non résolu</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Pièces de Rechange Utilisées</label>
          <div className="parts-table">
            <div className="parts-table-head">
              <span>Nom de la pièce</span>
              <span>Quantité</span>
              <span />
            </div>
            {parts.map((part) => (
              <div className="parts-table-row" key={part.id}>
                <input
                  type="text"
                  value={part.name}
                  placeholder="Ex: Filtre à huile"
                  onChange={(e) => updatePart(part.id, { name: e.target.value })}
                  disabled={isSaving}
                />
                <input
                  type="number"
                  min={1}
                  value={part.quantity}
                  onChange={(e) =>
                    updatePart(part.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                  }
                  disabled={isSaving}
                />
                <button
                  type="button"
                  className="remove-part"
                  onClick={() => removePart(part.id)}
                  aria-label="Retirer la pièce"
                  disabled={isSaving}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-part-link" onClick={addPart} disabled={isSaving}>
            + Ajouter une pièce
          </button>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn-outline" onClick={onCancel} disabled={isSaving}>
              Annuler
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Enregistrement…' : "Enregistrer l'intervention"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span className="info-item-label">{label}</span>
      <span className="info-item-value">{value}</span>
    </div>
  );
}