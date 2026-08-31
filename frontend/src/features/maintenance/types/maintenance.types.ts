export type Status = 'New' | 'PendingValidation' | 'Approved' | 'InProgress' | 'OnHold' | 'Completed' | 'Closed' | 'Rejected';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceType = 'Corrective' | 'Preventive' | 'Amelioration' | 'Inspection';

export interface RequestCard {
  id: string;
  ticketNumber: string;
  equipmentName: string;
  priority: Priority;
  status: Status;
  assignedTechnicianName: string | null;
  reportedAt: string;
}

export interface RequestDetail extends RequestCard {
  title: string;
  description: string;
  failureCategory: string;
  equipmentId: string;
  requesterId: string;
  requesterName: string;
  assignedTechnicianId: string | null;
  maintenanceType: MaintenanceType | null;
  dueDate: string | null;
  instructions: string | null;
  startedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
}

export interface AssignPayload {
  technicianId: string;
  dueDate: string;
  maintenanceType: number; // 0=Corrective,1=Preventive,2=Amelioration,3=Inspection
  instructions?: string;
}

export interface ChangeStatusPayload {
  newStatus: Status;
  changedByUserId: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  failureCategory: string;
  equipmentId: string;
  requesterId: string;
  priority: number; // 0=Low,1=Medium,2=High,3=Critical
}

export interface PartPayload {
  name: string;
  quantity: number;
}

export interface CreateInterventionPayload {
  technicianId: string;
  diagnosticDetails: string;
  actionsTaken: string;
  resultNotes?: string;
  startedAt: string;
  endedAt?: string;
  downtimeMinutes?: number;
  parts: PartPayload[];
}