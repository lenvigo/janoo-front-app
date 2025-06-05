import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      email,
      password,
    });
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, {
      name,
      email,
      password,
    });
  }
}
