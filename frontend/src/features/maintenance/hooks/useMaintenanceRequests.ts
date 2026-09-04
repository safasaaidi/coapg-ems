import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RequestCard, ChangeStatusPayload } from '../types/maintenance.types';
import { maintenanceService } from '../api/maintenanceService';

export function useMaintenanceRequests() {
  const [requests, setRequests] = useState<RequestCard[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getRequests();
      setRequests(data);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.message || 'Impossible de charger les demandes de maintenance.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (req) =>
        req.ticketNumber.toLowerCase().includes(q) ||
        req.equipmentName.toLowerCase().includes(q) ||
        (req.assignedTechnicianName && req.assignedTechnicianName.toLowerCase().includes(q))
    );
  }, [search, requests]);

  const updateRequestStatus = useCallback(
    async (id: string, payload: ChangeStatusPayload | any) => {
      const previousRequests = [...requests];

      // Mise à jour optimiste de l'interface
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: payload.newStatus } : r))
      );

      try {
        await maintenanceService.updateStatus(id, payload);
      } catch (err: any) {
        // En cas d'erreur, on annule la mise à jour optimiste
        setRequests(previousRequests);

        // PROPAGATION DE L'ERREUR COMPLÈTE :
        // On relance l'objet d'erreur Axios brut pour que MaintenancePage puisse extraire err.response.data
        throw err;
      }
    },
    [requests]
  );

  return {
    requests: filteredRequests,
    rawRequests: requests,
    loading,
    error,
    search,
    setSearch,
    refreshRequests: loadRequests,
    updateRequestStatus,
  };
}