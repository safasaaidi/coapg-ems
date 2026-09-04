import { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import { RequestDetailsModal } from '../components/RequestDetailsModal';
import { CreateMaintenanceRequestModal } from '../components/CreateMaintenanceRequestModal';
import { AssignRequestModal } from '../components/AssignRequestModal';
import { InterventionDetailModal } from "../../workOrders/components/InterventionDetailModal";
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { maintenanceService } from '../api/maintenanceService';
import { authService } from '../../auth/api/authService';
import api from '../../../services/api';
import type { RequestDetail, Status } from '../types/maintenance.types';

type ActiveView = 'kanban' | 'list' | 'intervention';

// Mapping des statuts texte vers les entiers Enum attendus par le Backend C#
const STATUS_TO_INT: Record<Status, number> = {
  New: 0,
  PendingValidation: 1,
  Approved: 2,
  InProgress: 3,
  OnHold: 4,
  Completed: 5,
  Closed: 6,
  Rejected: 7,
};

// GUID par défaut si l'ID utilisateur est absent ou invalide (évite le crash du parser C#)
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

const isValidGuid = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
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
    // Utilise le vrai GUID de l'utilisateur connecté s'il est valide, sinon null
    const sanitizedUserId = currentUserId && isValidGuid(currentUserId) 
      ? currentUserId 
      : null;

    const statusPayload = {
      newStatus: newStatus,
      status: STATUS_TO_INT[newStatus],
      statusValue: STATUS_TO_INT[newStatus],
      changedByUserId: sanitizedUserId,
    };

    await updateRequestStatus(id, statusPayload as any);
  } catch (err: any) {
    console.error("Détails de l'erreur API statut :", err);

    const apiErrorMessage =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.response?.data?.message ||
      err?.message;

    throw new Error(apiErrorMessage || 'Erreur lors de la mise à jour du statut.');
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
      <KanbanBoard
        requests={requests}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refreshRequests}
        onNewRequest={() => setIsCreateModalOpen(true)}
        onOpenCard={(id) => setSelectedRequestId(id)}
        onStatusChange={handleStatusChange}
        activeView={view === 'list' ? 'list' : 'kanban'}
        view={view === 'list' ? 'list' : 'kanban'}
        onViewChange={(newView) => setView(newView as ActiveView)}
        selectedPriority={priorityFilter}
        onPrioritySelect={setPriorityFilter}
      />

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