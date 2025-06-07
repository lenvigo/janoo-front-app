import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Incident {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  resolvedAt?: Date;
  managerId?: string;
  managerComment?: string;
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

  getIncident(id: string): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  createIncident(incident: {
    title: string;
    description: string;
  }): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  resolveIncident(id: string, managerComment?: string): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}/resolve`, {
      managerComment,
    });
  }

  closeIncident(id: string): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}/close`, {});
  }
}
