import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'OTHER';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private apiUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl);
  }

  getIncident(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  createIncident(
    incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  updateIncident(
    id: number,
    incident: Partial<Incident>
  ): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}`, incident);
  }

  closeIncident(id: number): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}/close`, {});
  }
}
