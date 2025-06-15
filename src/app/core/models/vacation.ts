export interface Vacation {
  id: string;
  user: string; // ID del usuario que pide las vacaciones
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  manager?: string; // ID del manager que aprobó/rechazó
  respondedAt?: string;
  reason?: string;
}

export interface CreateVacationDto {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface VacationBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}
