import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: {
    name: string;
    email: string;
    img?: string;
  }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, data);
  }

  listAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
