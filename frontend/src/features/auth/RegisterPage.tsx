import React, { useState } from 'react';
import api from '../../services/api';
import './RegisterPage.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Correspondance entre les libellés affichés et les vraies valeurs de l'enum UserRole côté backend
const ROLE_MAP: Record<string, string> = {
  Technicien: 'Technician',
  Responsable: 'ResponsableMaintenance',
  Operateur: 'Demandeur',
  Admin: 'Admin',
};

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    password: '',
    role: 'Technicien',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: ROLE_MAP[formData.role] ?? 'Demandeur',
      });

      // Connexion automatique : on stocke le token et l'utilisateur décodé,
      // exactement comme le fait authService.login()
      const { token } = response.data;
      localStorage.setItem('authToken', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        firstName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ?? '',
        lastName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ?? '',
      };
      localStorage.setItem('user', JSON.stringify(user));

      // Redirection directe vers le dashboard, sans repasser par l'écran de login
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
              placeholder="rida saaidi"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>EMAIL PROFESSIONNEL</label>
            <input
              type="email"
              required
              placeholder="rida@copag.ma"
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
  onChange={handleChange}
  className="w-full px-3 py-2 border rounded-md"
>
  <option value="Technician">Technicien</option>
  <option value="ResponsableMaintenance">Responsable Maintenance</option>
  <option value="Demandeur">Demandeur</option>
  <option value="Admin">Administrateur</option>
  <option value="Lecture">Lecture</option>
</select>

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