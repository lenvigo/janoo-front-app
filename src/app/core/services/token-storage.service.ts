import { Injectable } from '@angular/core';
import { User } from '../models/user';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {
    console.log('TokenStorageService initialized');
    const token = this.getToken();
    console.log('Current token:', token ? 'Present' : 'Not found');
  }

  signOut(): void {
    console.log('Signing out, removing token and user data');
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.clear();
    console.log(
      'Token removed, verifying:',
      this.getToken() ? 'Still present' : 'Removed'
    );
  }

  public saveToken(token: string): void {
    if (!token) {
      console.error('Attempting to save null or undefined token');
      return;
    }

    console.log('Saving token:', token.substring(0, 20) + '...');
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);

    const savedToken = this.getToken();
    if (savedToken === token) {
      console.log('Token saved successfully');
    } else {
      console.error('Token verification failed after save');
    }
  }

  public getToken(): string | null {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log('Retrieved token:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in storage');
    }
    return token;
  }

  public saveUser(user: User): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User | null {
    const userStr = window.localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  public isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar que el token tiene el formato correcto (Bearer token)
      return token.startsWith('Bearer ') || token.length > 10;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}
