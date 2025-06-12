export interface Incident {
  id: string;
  user: string; // ID del usuario
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  managerId?: string;
  resolvedAt?: string;
  managerComment?: string;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
}

export interface ResolveIncidentDto {
  managerComment?: string;
}
