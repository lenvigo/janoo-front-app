import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { TokenStorageService } from './token-storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private toastr: ToastrService
  ) {
    console.log('UserService initialized');
  }

  getProfile(): Observable<User> {
    console.log('UserService - Getting profile');
    const token = this.tokenStorage.getToken();
    console.log(
      'UserService - Current token:',
      token ? 'Present' : 'Not found'
    );

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<User>(`${this.baseUrl}/profile`, { headers }).pipe(
      tap({
        next: (response) =>
          console.log('UserService - Profile response:', response),
        error: (error) => console.error('UserService - Profile error:', error),
      })
    );
  }

  updateProfile(data: {
    name: string;
    email: string;
    img?: string;
  }): Observable<User> {
    console.log('UserService - Updating profile');
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put<User>(`${this.baseUrl}/profile`, data, { headers })
      .pipe(
        tap({
          next: (response) =>
            console.log('UserService - Update response:', response),
          error: (error) => console.error('UserService - Update error:', error),
        })
      );
  }

  listAll(): Observable<User[]> {
    console.log('UserService - Listing all users');
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<User[]>(this.baseUrl, { headers }).pipe(
      tap({
        next: (response) =>
          console.log('UserService - List response:', response),
        error: (error) => console.error('UserService - List error:', error),
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    console.log('UserService - Deleting user:', id);
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers }).pipe(
      tap({
        next: () => console.log('UserService - Delete successful'),
        error: (error) => console.error('UserService - Delete error:', error),
      })
    );
  }

  // Nuevos métodos para gestión de roles
  assignRole(userId: string, role: string): Observable<User> {
    console.log(`UserService - Assigning role ${role} to user ${userId}`);
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put<User>(`${this.baseUrl}/${userId}/roles`, { role }, { headers })
      .pipe(
        tap({
          next: (response) => {
            console.log('UserService - Role assignment successful:', response);
            this.toastr.success(`Rol ${role} asignado correctamente`);
          },
          error: (error) => {
            console.error('UserService - Role assignment error:', error);
            this.toastr.error('Error al asignar el rol');
          },
        })
      );
  }

  removeRole(userId: string, role: string): Observable<User> {
    console.log(`UserService - Removing role ${role} from user ${userId}`);
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<User>(`${this.baseUrl}/${userId}/roles/${role}`, { headers })
      .pipe(
        tap({
          next: (response) => {
            console.log('UserService - Role removal successful:', response);
            this.toastr.success(`Rol ${role} eliminado correctamente`);
          },
          error: (error) => {
            console.error('UserService - Role removal error:', error);
            this.toastr.error('Error al eliminar el rol');
          },
        })
      );
  }

  getAvailableRoles(): string[] {
    return ['ADMIN', 'MANAGER', 'USER'];
  }

  hasRole(role: string): boolean {
    const user = this.tokenStorage.getUser();
    return user?.roles?.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isManager(): boolean {
    return this.hasRole('MANAGER');
  }

  // Métodos para la gestión de roles
  getAllUsers(): Observable<User[]> {
    console.log('UserService - Getting all users');
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<User[]>(`${this.baseUrl}`, { headers }).pipe(
      tap({
        next: (response) =>
          console.log('UserService - Users response:', response),
        error: (error) => console.error('UserService - Users error:', error),
      })
    );
  }
}
