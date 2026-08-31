import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import type { Equipment, EquipmentStatus } from '../../shared/types/equipment';

export interface EquipmentFilters {
  search: string;
  site: string | 'all';
  department: string | 'all';
  status: EquipmentStatus | 'all';
}

const EMPTY_FILTERS: EquipmentFilters = { search: '', site: 'all', department: 'all', status: 'all' };

export function useEquipmentList() {
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [filters, setFilters] = useState<EquipmentFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/equipment')
      .then((res) => {
        // Adapte la forme réelle du backend (EquipmentDto) à la forme attendue par ce hook
        const mapped: Equipment[] = res.data.map((e: any) => ({
          id: e.id,
          code: e.code,
          name: e.name,
          site: e.departmentName, // le backend ne renvoie pas encore le site directement, à ajuster si besoin
          department: e.departmentName,
          status: e.status,
          criticality: e.criticality,
        }));
        setAllEquipments(mapped);
      })
      .catch(() => setError('Impossible de charger les équipements.'))
      .finally(() => setIsLoading(false));
  }, []);

  const equipments = useMemo(() => {
    return allEquipments.filter((eq) => {
      const matchesSearch =
        !filters.search ||
        eq.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        eq.code.toLowerCase().includes(filters.search.toLowerCase());
      const matchesSite = filters.site === 'all' || eq.site === filters.site;
      const matchesDepartment = filters.department === 'all' || eq.department === filters.department;
      const matchesStatus = filters.status === 'all' || eq.status === filters.status;
      return matchesSearch && matchesSite && matchesDepartment && matchesStatus;
    });
  }, [filters, allEquipments]);

  const sites = useMemo(() => Array.from(new Set(allEquipments.map((e) => e.site))), [allEquipments]);
  const departments = useMemo(() => Array.from(new Set(allEquipments.map((e) => e.department))), [allEquipments]);

  const summary = useMemo(
    () => ({
      total: allEquipments.length,
      operational: allEquipments.filter((e) => e.status === 'Operational').length,
      inMaintenance: allEquipments.filter((e) => e.status === 'InMaintenance').length,
      outOfService: allEquipments.filter((e) => e.status === 'Down').length,
    }),
    [allEquipments],
  );

  return { equipments, filters, setFilters, sites, departments, summary, isLoading, error };
}