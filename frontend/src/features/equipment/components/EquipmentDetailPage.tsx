import { useState } from 'react';
import { STATUS_LABELS, CRITICALITY_LABELS } from '../../../shared/types/equipment';
import type { Equipment } from '../../../shared/types/equipment';
//import "../styles/EquipmentDetailPage.css";
/**
 * Fiche équipement — fidèle à la Figure 2.7 du cahier des charges.
 * Reçoit l'équipement en prop (ou charge via GET /api/equipment/{id} — TODO).
 */

const TABS = ['Fiche Détaillée', 'Documents', 'Pièces de Rechange'] as const;

const MOCK_COMPONENTS = [
  { name: 'Moteur Diesel 200 HP', status: 'Operationnel' as const },
  { name: 'Système Hydraulique Principal', status: 'Operationnel' as const },
  { name: 'Transmission Dyna-VT', status: 'EnMaintenance' as const },
];

const MOCK_HISTORY = [
  { date: '17/08/2026', type: 'Corrective', title: 'Surchauffe moteur', technician: 'Youssef Alami' },
  { date: '02/08/2026', type: 'Préventive', title: 'Vidange et changement filtres', technician: 'Hassan Mehdi' },
];

interface EquipmentDetailPageProps {
  equipment?: Equipment;
  onBack?: () => void;
} 

const DEFAULT_EQUIPMENT: Equipment = {
  id: '1',
  code: 'EQ-2401',
  name: 'Tracteur Massey Ferguson 65',
  site: 'Ferme Nord',
  department: 'Agriculture',
  status: 'Operationnel',
  criticality: 'Critique',
};

export function EquipmentDetailPage({ equipment = DEFAULT_EQUIPMENT, onBack }: EquipmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Fiche Détaillée');

  return (
    <div className="equipment-detail">
      <div className="detail-header">
        <div>
          {onBack && (
            <button className="back-link" onClick={onBack}>
              ← Retour aux équipements
            </button>
          )}
          <h1>
            {equipment.code} — {equipment.name}
          </h1>
          <div className="detail-badges">
            <span className={`status-badge status-${equipment.status.toLowerCase()}`}>
              {STATUS_LABELS[equipment.status]}
            </span>
            <span className={`criticality-tag criticality-${equipment.criticality.toLowerCase()}`}>
              Criticité {CRITICALITY_LABELS[equipment.criticality]}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn-outline">Générer QR code</button>
          <button className="btn-primary">Modifier</button>
        </div>
      </div>

      <div className="detail-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`detail-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Fiche Détaillée' && (
        <div className="detail-grid">
          <div className="detail-card">
            <h2>Informations Générales</h2>
            <dl className="info-list">
              <InfoRow label="Site" value={equipment.site} />
              <InfoRow label="Département" value={equipment.department} />
              <InfoRow label="Marque" value="Massey Ferguson" />
              <InfoRow label="N° de série" value="MF-0850-2023" />
              <InfoRow label="Date de mise en service" value="12/03/2023" />
            </dl>
          </div>

          <div className="detail-card">
            <h2>Composants Principaux</h2>
            <ul className="component-list">
              {MOCK_COMPONENTS.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span className={`status-badge status-${c.status.toLowerCase()}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-card wide">
            <h2>Historique des Interventions</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Technicien</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((h, index) => (
                    <tr key={`${h.date}-${index}`}>                    <td>{h.date}</td>
                    <td>{h.type}</td>
                    <td>{h.title}</td>
                    <td>{h.technician}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Documents' && <p className="tab-placeholder">Aucun document associé pour le moment.</p>}
      {activeTab === 'Pièces de Rechange' && (
        <p className="tab-placeholder">Module pièces de rechange — prévu en phase 2 (cf. cahier des charges §3.2).</p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}