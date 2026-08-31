import { useMemo, useState } from 'react';
import '../styles/KanbanBoard.css';
import type { RequestCard, Status, Priority } from '../types/maintenance.types';

// Traduction UNIQUEMENT pour l'affichage — les vraies valeurs échangées avec l'API restent en anglais
const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'New', label: 'Nouveau', color: '#60a5fa' },
  { key: 'PendingValidation', label: 'Qualifié', color: '#a78bfa' },
  { key: 'Approved', label: 'Affecté', color: '#38bdf8' },
  { key: 'InProgress', label: 'En cours', color: '#f59e0b' },
  { key: 'OnHold', label: 'En attente', color: '#fb923c' },
  { key: 'Completed', label: 'Résolu', color: '#4ade80' },
  { key: 'Closed', label: 'Clôturé', color: '#94a3b8' },
];

const PRIORITY_LABEL: Record<Priority, string> = {
  Low: 'Faible',
  Medium: 'Moyenne',
  High: 'Élevée',
  Critical: 'Critique',
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
  // currentUserId : id de l'utilisateur connecté, requis par le backend pour la traçabilité (RG-10)
  onStatusChange: (id: string, newStatus: Status) => Promise<void>;
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
    e.dataTransfer.dropEffect = 'move';
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
      alert('Erreur lors de la mise à jour du statut — transition peut-être non autorisée.');
    } finally {
      setDraggedCardId(null);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="kanban-page">
      <div className="kanban-toolbar">
        <div>
          <h1>Tableau Kanban des Demandes de Maintenance</h1>
          <p>
            {currentDateFormatted} · {requests.length} demande{requests.length > 1 ? 's' : ''} affichée{requests.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="kanban-toolbar-actions">
          <input
            className="kanban-search"
            type="search"
            placeholder="Rechercher par ticket, équipement ou technicien…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="button" className="btn-primary" onClick={onNewRequest}>
            + Nouvelle Demande
          </button>
        </div>
      </div>

      {error && (
        <div className="kanban-error-banner">
          <span>{error}</span>
          <button type="button" className="kanban-error-retry" onClick={onRefresh}>
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="kanban-loading">Chargement des demandes de maintenance...</div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const cards = requests.filter((r) => r.status === col.key);
            const isColumnActive = dragOverColumn === col.key;

            return (
              <div
                key={col.key}
                className={`kanban-column ${isColumnActive ? 'is-drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-column-header">
                  <span className="kanban-dot" style={{ backgroundColor: col.color }} />
                  <span className="kanban-column-title">{col.label}</span>
                  <span className="kanban-count">{cards.length}</span>
                </div>

                <div className="kanban-column-body">
                  {cards.map((card) => {
                    const isDraggingThis = draggedCardId === card.id;
                    return (
                      <div
                        key={card.id}
                        className={`kanban-card ${isDraggingThis ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpenCard?.(card.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenCard?.(card.id);
                          }
                        }}
                      >
                        <div className="kanban-card-top">
                          <span className="kanban-card-id">{card.ticketNumber}</span>
                          <span
                            className={`priority-dot priority-${card.priority.toLowerCase()}`}
                            title={`Priorité : ${PRIORITY_LABEL[card.priority]}`}
                          />
                        </div>
                        <div className="kanban-card-equipment">{card.equipmentName}</div>
                        <div className="kanban-card-footer">
                          <span>{card.assignedTechnicianName ?? 'Non assigné'}</span>
                          <span>{new Date(card.reportedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && <div className="kanban-empty">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}