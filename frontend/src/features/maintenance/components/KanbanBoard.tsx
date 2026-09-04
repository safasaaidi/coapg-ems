import { useState } from 'react';
import '../styles/KanbanBoard.css';
import type { RequestCard, Status, Priority } from '../types/maintenance.types';

const COLUMNS: { key: Status; label: string; color: string; classSuffix: string }[] = [
  { key: 'New', label: 'Nouveau', color: '#6b7280', classSuffix: 'nouveau' },
  { key: 'PendingValidation', label: 'Qualifié', color: '#8b5cf6', classSuffix: 'qualifie' },
  { key: 'Approved', label: 'Affecté', color: '#3b82f6', classSuffix: 'affecte' },
  { key: 'InProgress', label: 'En Cours', color: '#eab308', classSuffix: 'encours' },
  { key: 'OnHold', label: 'En Attente', color: '#f97316', classSuffix: 'enattente' },
  { key: 'Completed', label: 'Résolu', color: '#10b981', classSuffix: 'resolu' },
  { key: 'Closed', label: 'Clôturé', color: '#059669', classSuffix: 'cloture' },
];

const PRIORITY_BADGES: Record<string, { label: string; className: string }> = {
  Critical: { label: 'Critique', className: 'p-badge-critical' },
  High: { label: 'Élevée', className: 'p-badge-high' },
  Medium: { label: 'Moyenne', className: 'p-badge-medium' },
  Low: { label: 'Basse', className: 'p-badge-low' },
  '3': { label: 'Critique', className: 'p-badge-critical' },
  '2': { label: 'Élevée', className: 'p-badge-high' },
  '1': { label: 'Moyenne', className: 'p-badge-medium' },
  '0': { label: 'Basse', className: 'p-badge-low' },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; badgeClass: string }> = {
  New: { label: 'Nouveau', color: '#6b7280', badgeClass: 'status-badge-nouveau' },
  PendingValidation: { label: 'Qualifié', color: '#8b5cf6', badgeClass: 'status-badge-qualifie' },
  Approved: { label: 'Affecté', color: '#3b82f6', badgeClass: 'status-badge-affecte' },
  InProgress: { label: 'En cours', color: '#eab308', badgeClass: 'status-badge-encours' },
  OnHold: { label: 'En attente', color: '#f97316', badgeClass: 'status-badge-enattente' },
  Completed: { label: 'Résolu', color: '#10b981', badgeClass: 'status-badge-resolu' },
  Closed: { label: 'Clôturé', color: '#059669', badgeClass: 'status-badge-cloture' },
  Rejected: { label: 'Rejeté', color: '#ef4444', badgeClass: 'status-badge-nouveau' },
};

interface KanbanBoardProps {
  requests: RequestCard[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onNewRequest?: () => void;
  onOpenCard?: (id: string) => void;
  onStatusChange: (id: string, newStatus: Status) => Promise<void>;
  activeView?: 'kanban' | 'list';
  view?: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  selectedPriority?: string;
  onPrioritySelect?: (priority: string) => void;
}

export function KanbanBoard({
  requests,
  loading,
  error,
  search,
  onSearchChange,
  onRefresh,
  onNewRequest,
  onOpenCard,
  onStatusChange,
  activeView,
  view,
  onViewChange,
  selectedPriority = 'ALL',
  onPrioritySelect,
}: KanbanBoardProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  const currentView = activeView || view || 'kanban';

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragOverColumn !== status) setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragOverColumn === status) setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    setDragOverColumn(null);

    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId) return;

    const card = requests.find((r) => r.id === cardId);
    if (!card || card.status === targetStatus) {
      setDraggedCardId(null);
      return;
    }

    try {
      await onStatusChange(cardId, targetStatus);
    } catch (err: any) {
      // Affiche le vrai message renvoyé par votre API au lieu d'un message générique
      alert(err?.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setDraggedCardId(null);
    }
  };

  // Compteurs par priorité
  const countAll = requests.length;
  const countCritical = requests.filter((r) => String(r.priority) === 'Critical' || String(r.priority) === '3').length;
  const countHigh = requests.filter((r) => String(r.priority) === 'High' || String(r.priority) === '2').length;
  const countMedium = requests.filter((r) => String(r.priority) === 'Medium' || String(r.priority) === '1').length;
  const countLow = requests.filter((r) => String(r.priority) === 'Low' || String(r.priority) === '0').length;

  const filteredRequests = requests.filter((r) => {
    // Filtre Priorité
    if (selectedPriority !== 'ALL') {
      const p = String(r.priority);
      if (selectedPriority === 'Critical' && p !== 'Critical' && p !== '3') return false;
      if (selectedPriority === 'High' && p !== 'High' && p !== '2') return false;
      if (selectedPriority === 'Medium' && p !== 'Medium' && p !== '1') return false;
      if (selectedPriority === 'Low' && p !== 'Low' && p !== '0') return false;
    }

    // Filtre Recherche
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      const ticket = (r.ticketNumber || '').toLowerCase();
      const equipment = (r.equipmentName || '').toLowerCase();
      const tech = (r.assignedTechnicianName || '').toLowerCase();
      if (!ticket.includes(q) && !equipment.includes(q) && !tech.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="kanban-wrapper">
      {/* En-tête Dynamique */}
      <div className="kanban-header-bar">
        <div>
          <h1 className="kanban-main-title">
            {currentView === 'kanban' ? 'Tableau Kanban des Demandes' : 'Liste des Demandes de Maintenance'}
          </h1>
          <p className="kanban-sub-title">
            {countAll} demandes au total · {countCritical} critiques
          </p>
        </div>

        <div className="kanban-top-actions">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="kanban-search-input"
              placeholder="Rechercher ticket, matériel..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="view-mode-selector">
            <button
              type="button"
              className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => onViewChange('list')}
            >
              ☰ Vue Liste
            </button>
            <button
              type="button"
              className={`view-btn ${currentView === 'kanban' ? 'active' : ''}`}
              onClick={() => onViewChange('kanban')}
            >
              ░ Vue Kanban
            </button>
          </div>

          {onNewRequest && (
            <button type="button" className="btn-add-request" onClick={onNewRequest}>
              + Nouvelle Demande
            </button>
          )}
        </div>
      </div>

      {/* Cartes KPI / Barre de progression des statuts */}
      <div className="segmented-progress-card">
        <div className="segmented-bar">
          {COLUMNS.map((col) => {
            const count = requests.filter((r) => r.status === col.key).length;
            return (
              <div key={col.key} className="segment-col">
                <div className="segment-top">
                  <span className="dot-indicator" style={{ backgroundColor: col.color }} />
                  <span>{col.label}</span>
                </div>
                <div className="segment-line-track">
                  <div
                    className="segment-line-fill"
                    style={{
                      backgroundColor: col.color,
                      width: count > 0 ? '100%' : '0%',
                    }}
                  />
                </div>
                <span className="segment-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pilules de filtres de priorité */}
      <div className="priority-pills-bar">
        <button
          type="button"
          className={`pill-btn ${selectedPriority === 'ALL' ? 'active' : ''}`}
          onClick={() => onPrioritySelect?.('ALL')}
        >
          Toutes ({countAll})
        </button>
        <button
          type="button"
          className={`pill-btn pill-critical ${selectedPriority === 'Critical' ? 'active' : ''}`}
          onClick={() => onPrioritySelect?.('Critical')}
        >
          ● Critique ({countCritical})
        </button>
        <button
          type="button"
          className={`pill-btn pill-high ${selectedPriority === 'High' ? 'active' : ''}`}
          onClick={() => onPrioritySelect?.('High')}
        >
          ● Élevée ({countHigh})
        </button>
        <button
          type="button"
          className={`pill-btn pill-medium ${selectedPriority === 'Medium' ? 'active' : ''}`}
          onClick={() => onPrioritySelect?.('Medium')}
        >
          ● Moyenne ({countMedium})
        </button>
        <button
          type="button"
          className={`pill-btn pill-low ${selectedPriority === 'Low' ? 'active' : ''}`}
          onClick={() => onPrioritySelect?.('Low')}
        >
          ● Basse ({countLow})
        </button>
      </div>

      {error && (
        <div className="kanban-error-banner">
          <span>{error}</span>
          <button type="button" onClick={onRefresh}>Réessayer</button>
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="kanban-loading">Chargement...</div>
      ) : currentView === 'kanban' ? (
        /* VUE KANBAN (GRILLE) */
        <div className="kanban-grid-container">
          {COLUMNS.map((col) => {
            const cards = filteredRequests.filter((r) => r.status === col.key);
            const isOver = dragOverColumn === col.key;

            return (
              <div
                key={col.key}
                className={`kanban-col-box col-theme-${col.classSuffix} ${isOver ? 'is-drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-col-header">
                  <div className="col-header-left">
                    <span className="dot-indicator" style={{ backgroundColor: col.color }} />
                    <span className="col-title-text">{col.label}</span>
                  </div>
                  <span className="col-badge-count">{cards.length}</span>
                </div>

                <div className="kanban-col-cards">
                  {cards.map((card) => {
                    const isDragging = draggedCardId === card.id;
                    const pInfo = PRIORITY_BADGES[String(card.priority)] || PRIORITY_BADGES.Medium;

                    return (
                      <div
                        key={card.id}
                        className={`card-item ${isDragging ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpenCard?.(card.id)}
                      >
                        <div className="card-item-header">
                          <span className="card-ticket-id">{card.ticketNumber}</span>
                          <span className={`priority-tag ${pInfo.className}`}>
                            ● {pInfo.label}
                          </span>
                        </div>

                        <div className="card-equipment-title">{card.equipmentName}</div>

                        <div className="card-tags-row">
                          <span className="type-badge corrective">Corrective</span>
                          {card.status === 'Completed' || card.status === 'Closed' ? (
                            <span className="type-badge valid">● Validé</span>
                          ) : null}
                        </div>

                        <div className="card-item-footer">
                          <div className="user-avatar-info">
                            <div className="mini-avatar">
                              {card.assignedTechnicianName
                                ? card.assignedTechnicianName.substring(0, 2).toUpperCase()
                                : 'NA'}
                            </div>
                            <div className="user-text-details">
                              <span className="tech-name">
                                {card.assignedTechnicianName ?? 'Non assigné'}
                              </span>
                              <span className="tech-role">Technicien</span>
                            </div>
                          </div>
                          <span className="card-date-text">
                            {new Date(card.reportedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && <div className="kanban-empty-slot">Aucune demande</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VUE LISTE (TABLEAU SOMBRE STYLISÉ COPAG EMS) */
        <div className="kanban-table-wrapper">
          <table className="kanban-table">
            <thead>
              <tr>
                <th>N° Ticket</th>
                <th>Équipement</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Technicien</th>
                <th>Date Signalement</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const pInfo = PRIORITY_BADGES[String(req.priority)] || PRIORITY_BADGES.Medium;
                const statusInfo = STATUS_CONFIG[req.status] || STATUS_CONFIG.New;

                return (
                  <tr key={req.id} onClick={() => onOpenCard?.(req.id)} className="table-row-clickable">
                    <td className="ticket-code-cell">{req.ticketNumber}</td>
                    <td className="equipment-cell">{req.equipmentName}</td>
                    <td>
                      <span className={`priority-tag ${pInfo.className}`}>
                        ● {pInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className={`table-status-badge ${statusInfo.badgeClass}`}>
                        <span className="dot-indicator" style={{ backgroundColor: statusInfo.color }} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="user-avatar-info">
                        <div className="mini-avatar">
                          {req.assignedTechnicianName
                            ? req.assignedTechnicianName.substring(0, 2).toUpperCase()
                            : 'NA'}
                        </div>
                        <div className="user-text-details">
                          <span className="tech-name">{req.assignedTechnicianName ?? 'Non assigné'}</span>
                          <span className="tech-role">Technicien</span>
                        </div>
                      </div>
                    </td>
                    <td className="card-date-text">
                      {new Date(req.reportedAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="kanban-empty-slot">
                    Aucune demande trouvée pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="kanban-table-footer">
            <span>Affichage de <strong>{filteredRequests.length}</strong> sur <strong>{requests.length}</strong> demandes</span>
          </div>
        </div>
      )}
    </div>
  );
}