export interface Checkin {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  type: 'IN' | 'OUT';
  timestamp: string;
}
