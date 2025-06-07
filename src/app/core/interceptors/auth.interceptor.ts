import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpHeaders,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  console.log('AuthInterceptor - Intercepting request:', req.url);

  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
  console.log(
    'AuthInterceptor - Token from storage:',
    token ? 'Present' : 'Not found'
  );

  // No interceptar peticiones a /auth
  if (req.url.includes('/auth')) {
    console.log('AuthInterceptor - Skipping auth request');
    return next(req);
  }

  if (token) {
    // Crear nuevos headers manteniendo los headers existentes
    const headers = new HttpHeaders({
      ...Object.fromEntries(
        req.headers.keys().map((key) => [key, req.headers.get(key) || ''])
      ),
      Authorization: `Bearer ${token}`,
    });

    const authReq = req.clone({
      headers: headers,
    });

    console.log('AuthInterceptor - Request headers:', authReq.headers.keys());
    console.log(
      'AuthInterceptor - Authorization header:',
      authReq.headers.get('Authorization')
    );
    return next(authReq);
  }

  console.log(
    'AuthInterceptor - No token available, proceeding without auth header'
  );
  return next(req);
};
