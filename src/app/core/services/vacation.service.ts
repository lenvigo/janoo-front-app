import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vacation {
  id: number;
  startDate: Date;
  endDate: Date;
  type: 'ANNUAL' | 'SICK' | 'OTHER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class VacationService {
  private apiUrl = `${environment.apiUrl}/vacations`;

  constructor(private http: HttpClient) {}

  getVacations(): Observable<Vacation[]> {
    return this.http.get<Vacation[]>(this.apiUrl);
  }

  getVacation(id: number): Observable<Vacation> {
    return this.http.get<Vacation>(`${this.apiUrl}/${id}`);
  }

  createVacation(
    vacation: Omit<Vacation, 'id' | 'createdAt'>
  ): Observable<Vacation> {
    return this.http.post<Vacation>(this.apiUrl, vacation);
  }

  updateVacation(
    id: number,
    vacation: Partial<Vacation>
  ): Observable<Vacation> {
    return this.http.put<Vacation>(`${this.apiUrl}/${id}`, vacation);
  }

  cancelVacation(id: number): Observable<Vacation> {
    return this.http.patch<Vacation>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
