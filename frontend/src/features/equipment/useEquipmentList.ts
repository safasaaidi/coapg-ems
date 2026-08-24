import { useQuery } from '@tanstack/react-query'; // outil qui gère chargement/erreur automatiquement
import httpClient from '../../services/httpClient'; // le "coursier" qui sait parler à l'API

export function useEquipmentList() {
  return useQuery({
    queryKey: ['equipment'],      // une étiquette pour identifier cette donnée
    queryFn: async () => {
      const response = await httpClient.get('/equipment'); // appelle http://localhost:5109/api/equipment
      return response.data;       // renvoie la liste reçue
    },
  });
}