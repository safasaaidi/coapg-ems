import { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import { RequestDetailsModal } from '../components/RequestDetailsModal';
import { CreateMaintenanceRequestModal } from '../components/CreateMaintenanceRequestModal';
import { AssignRequestModal } from "../components/AssignRequestModal";
//import { InterventionPage } from '../components/InterventionPage';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { maintenanceService } from '../api/maintenanceService';
import { authService } from '../../auth/api/authService';
import api from '../../../services/api';
import type { RequestDetail, Status } from '../types/maintenance.types';

type ActiveView = 'kanban' | 'intervention';

export function MaintenancePage() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [view, setView] = useState<ActiveView>('kanban');
  const [interventionTarget, setInterventionTarget] = useState<RequestDetail | null>(null);

  const {
    requests, loading, error, search, setSearch, refreshRequests, updateRequestStatus,
  } = useMaintenanceRequests();

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id ?? '';

  useEffect(() => {
    api.get('/users').then((res) => {
      const techs = res.data
        .filter((u: any) => u.role === 'Technician')
        .map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));
      setTechnicians(techs);
    });
  }, []);

  const handleStatusChange = async (id: string, newStatus: Status) => {
    await updateRequestStatus(id, { newStatus, changedByUserId: currentUserId });
  };

  // Depuis la carte Kanban ou la modale détail : ouvrir l'écran d'intervention
  const handleOpenIntervention = async (id: string) => {
    const detail = await maintenanceService.getRequestById(id);
    setInterventionTarget(detail);
    setSelectedRequestId(null);
    setView('intervention');
  };

  const handleInterventionSaved = () => {
    setView('kanban');
    setInterventionTarget(null);
    refreshRequests();
  };

  if (view === 'intervention' && interventionTarget) {
    return (
      <InterventionPage
        requestDetails={interventionTarget}
        currentUserId={currentUserId}
        onCancel={() => setView('kanban')}
        onSaved={handleInterventionSaved}
      />
    );
  }

  return (
    <div className="maintenance-feature-container">
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