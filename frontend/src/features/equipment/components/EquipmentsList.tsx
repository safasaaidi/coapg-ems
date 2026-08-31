import { useEquipmentList } from '../useEquipmentList';
import { STATUS_LABELS, CRITICALITY_LABELS } from '../../../shared/types/equipment';
import type { EquipmentStatus } from '../../../shared/types/equipment';
import '../styles/Equipementlist.css';

interface EquipmentsListProps {
  onSelect?: (id: string) => void;
}

export function EquipmentsList({ onSelect }: EquipmentsListProps) {
  const { equipments, filters, setFilters, sites, departments, summary } = useEquipmentList();

  return (
    <div className="equipment-page">
      <div className="equipment-header">
        <div>
          <h1>Équipements</h1>
          <p>Gestion et suivi du parc matériel COPAG</p>
        </div>
        <div className="equipment-actions">
          <button className="btn-outline">Exporter</button>
          <button className="btn-primary">+ Ajouter un équipement</button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total équipements" value={summary.total} hint="+2 ce mois" />
        <SummaryCard label="Opérationnels" value={summary.operational} hint={`${percentage(summary.operational, summary.total)} du parc`} tone="green" />
        <SummaryCard label="En maintenance" value={summary.inMaintenance} hint="dont 2 critiques" tone="amber" />
        <SummaryCard label="Hors service" value={summary.outOfService} hint="intervention requise" tone="red" />
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Rechercher un équipement (code ou nom)…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select value={filters.site} onChange={(e) => setFilters({ ...filters, site: e.target.value })}>
          <option value="all">Tous les sites</option>
          {sites.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
          <option value="all">Tous les départements</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as EquipmentStatus | 'all' })}
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="equipment-table-card">
        <table className="equipment-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom de l'équipement</th>
              <th>Site</th>
              <th>Département</th>
              <th>Statut</th>
              <th>Criticité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map((eq) => (
              <tr key={eq.id}>
                <td className="code-cell">{eq.code}</td>
                <td>{eq.name}</td>
                <td>{eq.site}</td>
                <td>{eq.department}</td>
                <td>
                  <StatusBadge status={eq.status} />
                </td>
                <td>
                  <span className={`criticality-tag criticality-${eq.criticality.toLowerCase()}`}>
                    {CRITICALITY_LABELS[eq.criticality]}
                  </span>
                </td>
                <td className="actions-cell">
  <button className="link-button" onClick={() => onSelect?.(eq.id)}>Voir</button>
               <button className="link-button">Modifier</button>
              </td>
              </tr>
            ))}
            {equipments.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  Aucun équipement ne correspond à ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: 'green' | 'amber' | 'red';
}) {
  return (
    <div className="summary-card">
      <div className="summary-label">{label}</div>
      <div className={`summary-value${tone ? ` tone-${tone}` : ''}`}>{value}</div>
      <div className="summary-hint">{hint}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: EquipmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}

function percentage(part: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}
