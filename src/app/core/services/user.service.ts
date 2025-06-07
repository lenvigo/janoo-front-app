import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
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
}
