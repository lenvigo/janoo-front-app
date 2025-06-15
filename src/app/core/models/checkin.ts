export interface Checkin {
  id: string;
  user: string; // ID del usuario
  type: 'IN' | 'OUT';
  timestamp: string;
}

export interface CreateCheckinDto {
  type: 'IN' | 'OUT';
}
