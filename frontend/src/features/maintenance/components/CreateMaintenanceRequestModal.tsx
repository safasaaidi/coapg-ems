import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
//import { maintenanceService } from '../api/maintenanceService';
//import { equipmentService } from '../../equipment/api/equipmentService';
import '../styles/CreateMaintenanceRequestModal.css';

const PRIORITIES: { value: number; key: string; label: string }[] = [
  { value: 0, key: 'Low', label: 'Basse' },
  { value: 1, key: 'Medium', label: 'Moyenne' },
  { value: 2, key: 'High', label: 'Élevée' },
  { value: 3, key: 'Critical', label: 'Critique' },
];

interface CreateMaintenanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  currentUserId: string;
}

export function CreateMaintenanceRequestModal({
  isOpen,
  onClose,
  onSubmitted,
  currentUserId,
}: CreateMaintenanceRequestModalProps) {
  const [title, setTitle] = useState('');
  const [failureCategory, setFailureCategory] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string; code: string }[]>([]);
  const [priority, setPriority] = useState<number>(1);
  const [description, setDescription] = useState('');
  
  // Nouveaux états pour la pièce jointe
  const [attachment, setAttachment] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      equipmentService.getAll().then((data) =>
        setEquipmentOptions(data.map((e: any) => ({ id: e.id, name: e.name, code: e.code })))
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setFailureCategory('');
    setEquipmentId('');
    setPriority(1);
    setDescription('');
    setAttachment(null); // Réinitialisation du fichier
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optionnel : vérification de taille (ex: max 10 Mo)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 Mo.');
        return;
      }
      setAttachment(file);
      setError(null);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !failureCategory || !equipmentId) {
      setError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      await maintenanceService.createRequest({
        title,
        description,
        failureCategory,
        equipmentId,
        requesterId: currentUserId,
        priority,
        attachment, // Transmission du fichier au service
      });

      resetForm();
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création de la demande.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose} disabled={isSubmitting} aria-label="Fermer">
          &times;
        </button>

        <div className="modal-body-content">
          <form className="request-form" onSubmit={handleSubmit} noValidate>
            <h1>Déclarer un Incident / Signalement de Panne</h1>
            <p className="form-hint">Renseignez les détails ci-dessous. Les champs avec * sont obligatoires.</p>

            {error && <div className="form-error-banner">{error}</div>}

            <div className="field">
              <label htmlFor="incident-title">Titre de l'incident *</label>
              <input
                id="incident-title"
                type="text"
                placeholder="Résumé clair et bref du problème"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="incident-category">Catégorie de panne *</label>
              <select
                id="incident-category"
                value={failureCategory}
                onChange={(e) => setFailureCategory(e.target.value)}
                disabled={isSubmitting}
                required
              >
                <option value="" disabled>Sélectionner…</option>
                <option value="Électrique">Électrique</option>
                <option value="Mécanique">Mécanique</option>
                <option value="Logiciel">Logiciel</option>
                <option value="Hydraulique">Hydraulique</option>
                <option value="Automatisme">Automatisme</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="equipment-select">Sélection de l'équipement *</label>
              <select
                id="equipment-select"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                disabled={isSubmitting}
                required
              >
                <option value="" disabled>Sélectionner un équipement…</option>
                {equipmentOptions.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.code} — {eq.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Niveau de Priorité *</label>
              <div className="priority-toggle">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    disabled={isSubmitting}
                    className={`priority-btn priority-${p.key.toLowerCase()}${priority === p.value ? ' active' : ''}`}
                    onClick={() => setPriority(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description détaillée</label>
              <textarea
                id="description"
                rows={4}
                placeholder="Décrivez les symptômes physiques, codes d'erreur, bruit anormal, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Champ de pièce jointe */}
            <div className="field">
              <label htmlFor="attachment">Pièce jointe (Photo de la panne, document PDF...)</label>
              <input
                id="attachment"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="file-input"
              />
              {attachment && (
                <div className="file-info" style={{ marginTop: '6px', fontSize: '0.85rem', color: '#4b5563' }}>
                  Fichier sélectionné : <strong>{attachment.name}</strong> ({(attachment.size / 1024).toFixed(1)} Ko)
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    style={{ marginLeft: '10px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={handleClose} disabled={isSubmitting}>
                Annuler
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours…' : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}