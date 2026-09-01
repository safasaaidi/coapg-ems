import React, { useState } from 'react';
import { authService } from './api/authService';
import api from '../../services/api';
interface LoginPageProps {
  onLoginSuccess: (userRole?: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  // États de connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [regPassword, setRegPassword] = useState('');

  // États pour les modales
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Formulaire de demande d'accès
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regRole, setRegRole] = useState('Technicien');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // 1. Soumission de la connexion backend
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage('');

  if (!email || !password) {
    setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
    return;
  }

  try {
    setIsLoading(true);
    const user = await authService.login(email, password);
    onLoginSuccess(user.role);
  } catch (err: any) {
    console.error('Erreur de connexion:', err);
    setErrorMessage(
      err.response?.data?.message || 'Email ou mot de passe incorrect.'
    );
  } finally {
    setIsLoading(false);
  }
};

  // 2. Connexion Google SSO
  const handleGoogleLogin = () => {
    // Redirection vers le point d'entrée OAuth de votre API backend .NET
    window.location.href = 'http://localhost:5109/api/auth/google-login';
  };

  // 3. Soumission de la demande d'accès
const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const [firstName, ...rest] = regFullName.trim().split(' ');
    const lastName = rest.join(' ') || firstName;
    const roleMap: Record<string, string> = {
      'Technicien': 'Technician',
      'Responsable Maintenance': 'ResponsableMaintenance',
      'Demandeur': 'Demandeur',
    };
    await api.post('/users', {
      firstName,
      lastName,
      email: regEmail,
      password: regPassword,
      role: roleMap[regRole],
    });
    setRegSuccessMsg("Votre compte a été créé. Un administrateur doit l'activer.");
    setTimeout(() => {
      setRegSuccessMsg('');
      setShowRegisterModal(false);
      setRegFullName(''); setRegEmail(''); setRegDepartment(''); setRegPassword('');
    }, 2500);
  } catch (err: any) {
    setRegSuccessMsg('');
    alert(err.response?.data?.message || 'Erreur lors de la création du compte.');
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* En-tête Logo */}
        <div style={styles.headerBox}>
          <h1 style={styles.logoTitle}>COPAG</h1>
          <p style={styles.logoSubtitle}>Plateforme de Gestion de Maintenance</p>
        </div>

        <h2 style={styles.title}>Bienvenue</h2>
        <p style={styles.subtitle}>Connectez-vous à votre espace COPAG EMS</p>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        {/* Formulaire de Connexion */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@copag.ma"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>MOT DE PASSE</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={styles.linkButton}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePasswordBtn}
              >
                {showPassword ? '👁️' : ' '}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.dividerRow}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OU</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Bouton Google */}
        <button type="button" onClick={handleGoogleLogin} style={styles.googleBtn}>
          <span style={{ marginRight: '8px' }}>🔍</span> Continuer avec Google
        </button>

        {/* Lien Demande d'accès */}
        <p style={styles.footerText}>
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            style={styles.registerBtn}
          >
            Demander un accès
          </button>
        </p>
      </div>

      {/* MODALE : Demander un accès */}
      {showRegisterModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Demande d'accès à la plateforme</h3>
            <p style={styles.modalSubtitle}>Remplissez ce formulaire pour obtenir vos identifiants.</p>

            {regSuccessMsg ? (
              <div style={styles.successBox}>{regSuccessMsg}</div>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>NOM COMPLET</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nom et Prénom"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>EMAIL PROFESSIONNEL</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="exemple@copag.ma"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>DÉPARTEMENT / SITE</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Ex: Production, Maintenance Taroudant"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
  <label style={styles.label}>MOT DE PASSE</label>
  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={styles.input} required />
</div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>RÔLE SOUHAITÉ</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    style={styles.input}
                  >
                    <option value="Technicien">Technicien</option>
                    <option value="Responsable Maintenance">Responsable Maintenance</option>
                    <option value="Demandeur">Demandeur (Opérateur)</option>
                  </select>
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    style={styles.cancelBtn}
                  >
                    Annuler
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Envoyer la demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE : Mot de passe oublié */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Réinitialisation du mot de passe</h3>
            <p style={styles.modalSubtitle}>Saisissez votre email pour recevoir les instructions.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Un email de réinitialisation a été envoyé.');
                setShowForgotModal(false);
              }}
              style={styles.form}
            >
              <div style={styles.fieldGroup}>
                <label style={styles.label}>EMAIL</label>
                <input type="email" placeholder="vous@copag.ma" style={styles.input} required />
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={styles.cancelBtn}
                >
                  Annuler
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles Inline
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  headerBox: {
    backgroundColor: '#1E5299',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoTitle: { fontSize: '22px', fontWeight: 'bold', margin: 0 },
  logoSubtitle: { fontSize: '11px', opacity: 0.9, marginTop: '2px' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#0F172A', margin: 0 },
  subtitle: { fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: '20px' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    color: '#991B1B',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '16px',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #86EFAC',
    color: '#166534',
    padding: '14px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#475569' },
  linkButton: { background: 'none', border: 'none', color: '#2563EB', fontSize: '11px', cursor: 'pointer' },
  passwordWrapper: { position: 'relative' },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
  },
  submitBtn: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#E2E8F0',
    color: '#334155',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
  },
  dividerRow: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#E2E8F0' },
  dividerText: { margin: '0 10px', fontSize: '11px', color: '#94A3B8' },
  googleBtn: {
    width: '100%',
    padding: '9px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { textAlign: 'center', fontSize: '12px', color: '#64748B', marginTop: '18px' },
  registerBtn: { background: 'none', border: 'none', color: '#000000', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  modalTitle: { fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 },
  modalSubtitle: { fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' },
};