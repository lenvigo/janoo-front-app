import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of, from, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/login-response';
import { TokenStorageService } from './token-storage.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private toastr: ToastrService
  ) {
    console.log('AuthService initialized');
    console.log(
      'Initial auth state:',
      this.isAuthenticated() ? 'Authenticated' : 'Not authenticated'
    );
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('AuthService - Attempting login for:', email);
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response: LoginResponse) => {
          console.log('Login response received:', response);
          if (response.token) {
            console.log('Saving token after login...');
            this.tokenStorage.saveToken(response.token);

            if (this.tokenStorage.isTokenValid()) {
              console.log('Token saved and validated successfully');
              this.router.navigate(['/users/profile']);
            } else {
              console.error('Token validation failed after login');
              this.toastr.error('Error al iniciar sesión', 'Error');
            }
          } else {
            console.error('No token in login response');
            this.toastr.error('Error al iniciar sesión', 'Error');
          }
        })
      );
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<LoginResponse> {
    console.log('AuthService - Attempting registration for:', email);
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/register`, {
        name,
        email,
        password,
      })
      .pipe(
        tap((response: LoginResponse) => {
          console.log('Register response received:', response);
          if (response.token) {
            console.log('Saving token after registration...');
            this.tokenStorage.saveToken(response.token);

            if (this.tokenStorage.isTokenValid()) {
              console.log('Token saved and validated successfully');
              this.router.navigate(['/users/profile']);
            } else {
              console.error('Token validation failed after registration');
              this.toastr.error('Error al registrar usuario', 'Error');
            }
          } else {
            console.error('No token in registration response');
            this.toastr.error('Error al registrar usuario', 'Error');
          }
        })
      );
  }

  logout(): void {
    console.log('Logging out...');
    const hadToken = this.tokenStorage.getToken() !== null;
    this.tokenStorage.signOut();

    if (!hadToken || !this.tokenStorage.getToken()) {
      console.log('Logout successful');
      this.router.navigate(['/auth/login']);
    } else {
      console.error('Token still present after logout');
      this.toastr.error('Error al cerrar sesión', 'Error');
    }
  }

  isAuthenticated(): boolean {
    const isAuth = this.tokenStorage.isTokenValid();
    console.log(
      'Authentication check:',
      isAuth ? 'Authenticated' : 'Not authenticated'
    );
    return isAuth;
  }

  navigateAfterAuth(route: string): Observable<boolean> {
    console.log('Attempting to navigate to:', route);
    if (!this.isAuthenticated()) {
      console.error('Navigation failed: Not authenticated');
      return from(this.router.navigate(['/auth/login']));
    }
    return from(this.router.navigate([route]));
  }

  verifyToken(): Observable<boolean> {
    const isValid = this.tokenStorage.isTokenValid();
    console.log('Token verification:', isValid ? 'Valid' : 'Invalid');
    if (!isValid) {
      return throwError(() => new Error('Invalid or missing token'));
    }
    return of(true);
  }
}
