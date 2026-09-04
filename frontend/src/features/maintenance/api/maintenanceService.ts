import type {
  RequestCard, RequestDetail, AssignPayload, ChangeStatusPayload,
  CreateRequestPayload, CreateInterventionPayload,
} from '../types/maintenance.types';
import api from '../../../services/api';
import type { Status } from '../types/maintenance.types';
const BASE_URL = '/maintenance-requests';

export const maintenanceService = {
  async getRequests(): Promise<RequestCard[]> {
    const response = await api.get<RequestCard[]>(BASE_URL);
    return response.data;
  },

  async getRequestById(id: string): Promise<RequestDetail> {
    const response = await api.get<RequestDetail>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Méthode mise à jour pour gérer le fichier/attachment en multipart/form-data
  async createRequest(payload: CreateRequestPayload): Promise<RequestDetail> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('failureCategory', payload.failureCategory);
    formData.append('equipmentId', payload.equipmentId);
    formData.append('requesterId', payload.requesterId);
    formData.append('priority', payload.priority.toString());
    
    if (payload.description) {
      formData.append('description', payload.description);
    }
    
    if (payload.attachment) {
      formData.append('attachment', payload.attachment);
    }

    const response = await api.post<RequestDetail>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async assignTechnician(id: string, payload: AssignPayload): Promise<RequestDetail> {
    const response = await api.patch<RequestDetail>(`${BASE_URL}/${id}/assign`, payload);
    return response.data;
  },

  async updateStatus(id: string, payload: ChangeStatusPayload): Promise<RequestDetail> {
    const response = await api.patch<RequestDetail>(`${BASE_URL}/${id}/status`, payload);
    return response.data;
  },

  async createIntervention(workOrderId: string, payload: CreateInterventionPayload) {
    const response = await api.post(`${BASE_URL}/${workOrderId}/interventions`, payload);
    return response.data;
  },

  async getHistory(id: string) {
    const response = await api.get(`${BASE_URL}/${id}/history`);
    return response.data;
  },
  async updateRequestStatus(
    id: string, 
    payload: { newStatus: Status; status?: number; changedByUserId?: string }
  ) {
    try {
      // Tentative d'envoi vers l'endpoint de mise à jour de statut
      const response = await api.put(`/maintenancerequests/${id}/status`, {
        newStatus: payload.newStatus,
        status: payload.status,
        changedByUserId: payload.changedByUserId,
      });
      return response.data;
    } catch (error: any) {
      // Propager directement la réponse Axios pour préserver les détails serveur
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
