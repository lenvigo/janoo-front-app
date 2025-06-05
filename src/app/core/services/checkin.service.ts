import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Checkin } from '../models/checkin';

@Injectable({
  providedIn: 'root',
})
export class CheckinService {
  private baseUrl = `${environment.apiUrl}/checkins`;

  constructor(private http: HttpClient) {}

  // Crear fichaje: { type: "IN" | "OUT" }
  create(type: 'IN' | 'OUT'): Observable<Checkin> {
    return this.http.post<Checkin>(this.baseUrl, { type });
  }

  // Listar fichajes:
  // - Si usuario ROLE normal → devuelve solo sus fichajes
  // - Si manager/admin → devuelve todos
  listAll(): Observable<Checkin[]> {
    return this.http.get<Checkin[]>(this.baseUrl);
  }
}
