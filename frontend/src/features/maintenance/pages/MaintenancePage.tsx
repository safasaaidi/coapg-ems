import { useState, useEffect, useMemo } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import { RequestDetailsModal } from '../components/RequestDetailsModal';
import { CreateMaintenanceRequestModal } from '../components/CreateMaintenanceRequestModal';
import { AssignRequestModal } from '../components/AssignRequestModal';
import { InterventionDetailModal } from "../../workOrders/components/InterventionDetailModal";
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { maintenanceService } from '../api/maintenanceService';
import { authService } from '../../auth/api/authService';
import api from '../../../services/api';
import type { RequestDetail, Status, Priority } from '../types/maintenance.types';

type ActiveView = 'kanban' | 'list' | 'intervention';

const STATUS_LABELS: Record<Status, string> = {
  New: 'Nouveau',
  PendingValidation: 'Qualifié',
  Approved: 'Affecté',
  InProgress: 'En cours',
  OnHold: 'En attente',
  Completed: 'Résolu',
  Closed: 'Clôturé',
  Rejected: 'Rejeté',
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Faible',
  Medium: 'Moyenne',
  High: 'Élevée',
  Critical: 'Critique',
  '0': 'Faible',
  '1': 'Moyenne',
  '2': 'Élevée',
  '3': 'Critique',
};

export function MaintenancePage() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [view, setView] = useState<ActiveView>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [interventionTarget, setInterventionTarget] = useState<RequestDetail | null>(null);

  const {
    requests,
    loading,
    error,
    search,
    setSearch,
    refreshRequests,
    updateRequestStatus,
  } = useMaintenanceRequests();

  // Extraction sécurisée de l'ID de l'utilisateur connecté
  const currentUser = authService.getCurrentUser();
  const currentUserId = String(
    currentUser?.id || currentUser?.userId || currentUser?.sub || ''
  );

  useEffect(() => {
    api.get('/users').then((res) => {
      const techs = res.data
        .filter((u: any) => u.role === 'Technician')
        .map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));
      setTechnicians(techs);
    }).catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updateRequestStatus(id, { newStatus, changedByUserId: currentUserId });
    } catch (err) {
      console.error("Erreur de changement de statut :", err);
      throw err; // Permet à KanbanBoard d'annuler le déplacement de la carte
    }
  };

  const handleOpenIntervention = async (id: string) => {
    try {
      const detail = await maintenanceService.getRequestById(id);
      setInterventionTarget(detail);
      setSelectedRequestId(null);
      setView('intervention');
    } catch {
      alert('Impossible de charger les détails pour l\'intervention.');
    }
  };

  const handleInterventionSaved = () => {
    setView('kanban');
    setInterventionTarget(null);
    refreshRequests();
  };

  const displayedRequests = useMemo(() => {
    if (priorityFilter === 'ALL') return requests;
    return requests.filter((r) => String(r.priority).toLowerCase() === priorityFilter.toLowerCase());
  }, [requests, priorityFilter]);

  if (view === 'intervention' && interventionTarget) {
    return (
      <InterventionDetailModal
        requestDetails={interventionTarget}
        currentUserId={currentUserId}
        onCancel={() => setView('kanban')}
        onSaved={handleInterventionSaved}
      />
    );
  }

  return (
    <div className="maintenance-feature-container p-4">
      {view === 'kanban' ? (
        <KanbanBoard
          requests={displayedRequests}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          onRefresh={refreshRequests}
          onNewRequest={() => setIsCreateModalOpen(true)}
          onOpenCard={(id) => setSelectedRequestId(id)}
          onStatusChange={handleStatusChange}
          view={view}
          onViewChange={(newView: string) => setView(newView as ActiveView)}
        />
      ) : (
        <div className="maintenance-list-view">
          <div className="list-header flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">Liste des Demandes</h2>
              <button
                type="button"
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
                onClick={() => setView('kanban')}
              >
                ← Vue Kanban
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="filter-group flex items-center gap-2">
                <label htmlFor="priority-filter" className="text-sm text-gray-300">Priorité :</label>
                <select
                  id="priority-filter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-2 py-1 text-sm"
                >
                  <option value="ALL">Toutes les priorités</option>
                  <option value="Low">Faible</option>
                  <option value="Medium">Moyenne</option>
                  <option value="High">Élevée</option>
                  <option value="Critical">Critique</option>
                </select>
              </div>

              <button 
                type="button" 
                className="btn-primary bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Nouvelle Demande
              </button>
            </div>
          </div>

          <table className="maintenance-table w-full text-left">
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
              {displayedRequests.map((req) => (
                <tr key={req.id} onClick={() => setSelectedRequestId(req.id)} className="clickable-row">
                  <td className="ticket-cell">{req.ticketNumber}</td>
                  <td>{req.equipmentName}</td>
                  <td>
                    <span className={`priority-badge priority-${String(req.priority).toLowerCase()}`}>
                      {PRIORITY_LABELS[String(req.priority)] || req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {STATUS_LABELS[req.status] || req.status}
                    </span>
                  </td>
                  <td>{req.assignedTechnicianName ?? 'Non assigné'}</td>
                  <td>{new Date(req.reportedAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {displayedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucune demande trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateMaintenanceRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitted={refreshRequests}
        currentUserId={currentUserId}
      />

      <RequestDetailsModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onStatusUpdated={refreshRequests}
        currentUserId={currentUserId}
        technicians={technicians}
        onOpenAssign={(id) => { setSelectedRequestId(null); setAssignRequestId(id); }}
        onOpenIntervention={handleOpenIntervention}
      />

      {assignRequestId && (
        <AssignRequestModal
          isOpen={!!assignRequestId}
          requestId={assignRequestId}
          onClose={() => setAssignRequestId(null)}
          onAssigned={() => { setAssignRequestId(null); refreshRequests(); }}
        />
      )}
    </div>
  );
}