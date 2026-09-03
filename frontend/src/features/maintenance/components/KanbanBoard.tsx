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
  activeView: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  selectedPriority: string;
  onPrioritySelect: (priority: string) => void;
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
  onViewChange,
  selectedPriority,
  onPrioritySelect,
}: KanbanBoardProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

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
    } catch {
      alert('Erreur lors de la mise à jour du statut.');
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
    if (selectedPriority === 'ALL') return true;
    const p = String(r.priority);
    if (selectedPriority === 'Critical') return p === 'Critical' || p === '3';
    if (selectedPriority === 'High') return p === 'High' || p === '2';
    if (selectedPriority === 'Medium') return p === 'Medium' || p === '1';
    if (selectedPriority === 'Low') return p === 'Low' || p === '0';
    return true;
  });

  return (
    <div className="kanban-wrapper">
      {/* Dynamic Header */}
      <div className="kanban-header-bar">
        <div>
          <h1 className="kanban-main-title">Tableau Kanban des Demandes de Maintenance</h1>
          <p className="kanban-sub-title">
            {countAll} demandes · {countCritical} critiques · Août 2026
          </p>
        </div>

        <div className="kanban-top-actions">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="kanban-search-input"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="view-mode-selector">
            <button
              type="button"
              className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => onViewChange('list')}
            >
              ☰ Vue Liste
            </button>
            <button
              type="button"
              className={`view-btn ${activeView === 'kanban' ? 'active' : ''}`}
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

      {/* Segmented Status Progress Bar */}
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

      {/* Priority Pill Filters */}
      <div className="priority-pills-bar">
        <button
          type="button"
          className={`pill-btn ${selectedPriority === 'ALL' ? 'active' : ''}`}
          onClick={() => onPrioritySelect('ALL')}
        >
          Toutes ({countAll})
        </button>
        <button
          type="button"
          className={`pill-btn pill-critical ${selectedPriority === 'Critical' ? 'active' : ''}`}
          onClick={() => onPrioritySelect('Critical')}
        >
          ● Critique ({countCritical})
        </button>
        <button
          type="button"
          className={`pill-btn pill-high ${selectedPriority === 'High' ? 'active' : ''}`}
          onClick={() => onPrioritySelect('High')}
        >
          ● Élevée ({countHigh})
        </button>
        <button
          type="button"
          className={`pill-btn pill-medium ${selectedPriority === 'Medium' ? 'active' : ''}`}
          onClick={() => onPrioritySelect('Medium')}
        >
          ● Moyenne ({countMedium})
        </button>
        <button
          type="button"
          className={`pill-btn pill-low ${selectedPriority === 'Low' ? 'active' : ''}`}
          onClick={() => onPrioritySelect('Low')}
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

      {/* Grid Columns */}
      {loading ? (
        <div className="kanban-loading">Chargement...</div>
      ) : (
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
      )}
    </div>
  );
}