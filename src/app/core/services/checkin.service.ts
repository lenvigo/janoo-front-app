import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Checkin } from '../models/checkin';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CheckinService {
  private baseUrl = `${environment.apiUrl}/checkins`;

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('CheckinService - Initialized with baseUrl:', this.baseUrl);
  }

  // Crear fichaje: { type: "IN" | "OUT" }
  create(type: 'IN' | 'OUT'): Observable<Checkin> {
    console.log('CheckinService - Creating checkin:', type);
    return this.http.post<Checkin>(this.baseUrl, { type });
  }

  // Listar fichajes:
  // - Si usuario ROLE normal → devuelve solo sus fichajes
  // - Si manager/admin → devuelve todos
  listAll(): Observable<Checkin[]> {
    console.log('CheckinService - Listing checkins');
    // El backend ya maneja la lógica de roles, solo necesitamos hacer la petición
    return this.http.get<Checkin[]>(this.baseUrl);
  }
}
