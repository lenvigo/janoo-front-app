import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export interface Incident {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: Date;
  resolvedAt?: Date;
  managerId?: string;
  managerComment?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateIncidentDto {
  title: string;
  description: string;
}

interface ErrorResponse {
  message: string;
  status: number;
  error: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private apiUrl = `${environment.apiUrl}/incidents`;

  // Mapeo de mensajes de error en inglés a español
  private errorMessages: { [key: string]: string } = {
    'User not found': 'Usuario no encontrado',
    'User not authenticated': 'Usuario no autenticado',
    'Incident not found': 'Incidencia no encontrada',
    'Only managers can resolve incidents':
      'Solo los managers pueden resolver incidencias',
    'Internal server error': 'Error interno del servidor',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // Listar incidencias (el backend filtra según el rol del usuario)
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl).pipe(
      tap((response) => {
        console.log('Incidents received from backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Reportar una nueva incidencia
  reportIncident(incident: CreateIncidentDto): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident).pipe(
      tap((response) => {
        console.log('Incident created in backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Resolver una incidencia (solo managers y admin)
  resolveIncident(id: string, managerComment: string): Observable<Incident> {
    return this.http
      .put<Incident>(`${this.apiUrl}/${id}/resolve`, {
        managerComment,
      })
      .pipe(
        tap((response) => {
          console.log('Incident resolved in backend:', response);
        }),
        catchError((error) => this.handleError(error))
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Incident service error:', error);
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
    } else {
      // Error del servidor
      const errorResponse = error.error as ErrorResponse;

      if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, vuelva a iniciar sesión.';
        this.router.navigate(['/auth/login']);
      } else if (errorResponse?.message) {
        // Traducir el mensaje de error del backend
        errorMessage =
          this.errorMessages[errorResponse.message] || errorResponse.message;
      }
    }

    // Mostrar el mensaje de error en la interfaz
    this.toastr.error(errorMessage, 'Error', {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
    });

    // Devolver el error para que el componente pueda manejarlo
    return throwError(() => errorMessage);
  }
}
