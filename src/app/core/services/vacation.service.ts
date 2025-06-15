import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Vacation, CreateVacationDto } from '../../core/models/vacation';

// export interface Vacation {
//   id: string;
//   startDate: string;
//   endDate: string;
//   reason: string;
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   createdAt: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//   };
// }

interface ErrorResponse {
  message: string;
  status: number;
  error: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VacationService {
  private apiUrl = `${environment.apiUrl}/vacations`;

  // Mapeo de mensajes de error en inglés a español
  private errorMessages: { [key: string]: string } = {
    'You already have a vacation request for these dates':
      'Ya tienes una solicitud de vacaciones para estas fechas',
    'User not found': 'Usuario no encontrado',
    'User not authenticated': 'Usuario no autenticado',
    'Start date and end date are required':
      'La fecha de inicio y fin son requeridas',
    'Vacation ID is required': 'El ID de la vacación es requerido',
    'Vacation not found': 'Vacación no encontrada',
    'Only pending requests can be approved/rejected':
      'Solo las solicitudes pendientes pueden ser aprobadas/rechazadas',
    'Internal server error': 'Error interno del servidor',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    console.log('VacationService initialized with API URL:', this.apiUrl);
  }

  getVacations(): Observable<Vacation[]> {
    console.log('Getting vacations from backend...');
    return this.http.get<Vacation[]>(this.apiUrl).pipe(
      tap((response) => {
        console.log('Vacations received from backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // // Obtener vacaciones de un usuario específico
  // getUserVacations(userId: string): Observable<Vacation[]> {
  //   console.log('Getting user vacations from backend:', userId);
  //   return this.http.get<Vacation[]>(`${this.apiUrl}/user/${userId}`).pipe(
  //     tap((response) => {
  //       console.log('User vacations received from backend:', response);
  //     }),
  //     catchError((error) => this.handleError(error))
  //   );
  // }

  // getVacation(id: string): Observable<Vacation> {
  //   console.log('Getting vacation from backend:', id);
  //   return this.http.get<Vacation>(`${this.apiUrl}/${id}`).pipe(
  //     tap((response) => {
  //       console.log('Vacation received from backend:', response);
  //     }),
  //     catchError((error) => this.handleError(error))
  //   );
  // }

  createVacation(vacation: CreateVacationDto): Observable<Vacation> {
    console.log('Sending vacation to backend:', vacation);
    return this.http.post<Vacation>(this.apiUrl, vacation).pipe(
      tap((response) => {
        console.log('Vacation created in backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  approveVacation(id: string): Observable<Vacation> {
    console.log('Sending approval to backend for vacation:', id);
    return this.http.put<Vacation>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap((response) => {
        console.log('Vacation approved in backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  rejectVacation(id: string): Observable<Vacation> {
    console.log('Sending rejection to backend for vacation:', id);
    return this.http.put<Vacation>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      tap((response) => {
        console.log('Vacation rejected in backend:', response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Vacation service error:', error);
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
