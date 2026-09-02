import React, { useState } from 'react';
import api from '../../services/api';
import { authService } from '../../features/auth/api/authService';
import './RegisterPage.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    password: '',
    role: 'Technician',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Envoi explicite du rôle sélectionné
      await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        department: formData.department,
        password: formData.password,
        role: formData.role,
      });

      // 2. Authentification et sauvegarde du nouveau token/user
      await authService.login(formData.email, formData.password);

      // 3. Redirection vers le tableau de bord
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="register-modal">
        <div className="modal-header">
          <h2>Demande d'accès à la plateforme</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="modal-subtitle">Remplissez ce formulaire pour obtenir vos identifiants.</p>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NOM COMPLET</label>
            <input
              type="text"
              required
              placeholder="Safa Saidi"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>EMAIL PROFESSIONNEL</label>
            <input
              type="email"
              required
              placeholder="safa@copag.ma"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>DÉPARTEMENT / SITE</label>
            <input
              type="text"
              required
              placeholder="Contrôle Qualité, Taroudant"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>MOT DE PASSE</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>RÔLE SOUHAITÉ</label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="admin">Administrateur</option>
              <option value="Demandeur">Demandeur</option>
              <option value="Technician">Technicien</option>
              <option value="Supervisor">Responsable Maintenance</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}