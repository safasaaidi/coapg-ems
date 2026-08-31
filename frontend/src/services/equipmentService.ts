import api from './api'; // Importation directe de votre instance API centralisée
import type { Equipment } from '../shared/types/equipment';

export const equipmentService = {
  // Récupérer la liste de tous les équipements
  async getAll(): Promise<Equipment[]> {
    const response = await api.get('/equipments');
    return response.data;
  },

  // Récupérer un équipement par son ID
  async getById(id: number): Promise<Equipment> {
    const response = await api.get(`/equipments/${id}`);
    return response.data;
  },

  // Créer un nouvel équipement
  async create(equipmentData: Omit<Equipment, 'id'>): Promise<Equipment> {
    const response = await api.post('/equipments', equipmentData);
    return response.data;
  },

  // Mettre à jour un équipement
  async update(id: number, equipmentData: Partial<Equipment>): Promise<Equipment> {
    const response = await api.put(`/equipments/${id}`, equipmentData);
    return response.data;
  },

  // Supprimer un équipement
  async delete(id: number): Promise<void> {
    await api.delete(`/equipments/${id}`);
  },
};