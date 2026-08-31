export type EquipmentStatus = 'Operational' | 'InMaintenance' | 'Down' | 'Archived';
export type Criticality = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  site: string;
  department: string;
  status: EquipmentStatus;
  criticality: Criticality;
}

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  Operational: 'Opérationnel',
  InMaintenance: 'En maintenance',
  Down: 'Hors service',
  Archived: 'Archivé',
};

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  Low: 'Faible',
  Medium: 'Moyenne',
  High: 'Élevée',
  Critical: 'Critique',
};