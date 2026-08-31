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
      setError(err.message || 'Impossible de charger les demandes de maintenance.');
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

  // changedByUserId : à remplacer par l'id de l'utilisateur connecté (récupéré depuis le contexte d'auth)
  const updateRequestStatus = useCallback(
    async (id: string, payload: ChangeStatusPayload) => {
      const previousRequests = [...requests];

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: payload.newStatus } : r))
      );

      try {
        await maintenanceService.updateStatus(id, payload);
      } catch (err: any) {
        setRequests(previousRequests);
        throw new Error(err.message || 'Échec de la mise à jour sur le serveur.');
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