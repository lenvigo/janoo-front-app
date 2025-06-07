import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    const endpoint = type === 'IN' ? '/in' : '/out';
    return this.http.post<Checkin>(`${this.baseUrl}${endpoint}`, {}).pipe(
      map((checkin) => ({
        ...checkin,
        timestamp: new Date(checkin.timestamp).toISOString(),
      })),
      catchError(this.handleError)
    );
  }

  // Listar fichajes:
  // - Si usuario ROLE normal → devuelve solo sus fichajes
  // - Si manager/admin → devuelve todos
  listAll(): Observable<Checkin[]> {
    return this.http.get<Checkin[]>(this.baseUrl).pipe(
      map((checkins) =>
        checkins.map((checkin) => ({
          ...checkin,
          timestamp: new Date(checkin.timestamp).toISOString(),
        }))
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, vuelva a iniciar sesión.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
