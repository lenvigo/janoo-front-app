import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/login-response';
import { User } from '../models/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    password: '123456',
    email: 'test@example.com',
    roles: ['USER_ROLE'],
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token',
    user: mockUser,
  };

  beforeEach(() => {
    // Create spies
    tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
      'saveToken',
      'saveUser',
      'isTokenValid',
      'signOut',
      'getUser',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and navigate to profile', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(true);

      service.login('test@example.com', 'password').subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
        expect(tokenStorageSpy.saveToken).toHaveBeenCalledWith('mock-token');
        expect(tokenStorageSpy.saveUser).toHaveBeenCalledWith(mockUser);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users/profile']);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);
    });

    it('should handle login failure when token is invalid', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(false);

      service.login('test@example.com', 'password').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);

      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Error al iniciar sesión',
        'Error'
      );
    });
  });

  describe('register', () => {
    it('should register successfully and navigate to profile', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(true);

      service
        .register('Test User', 'test@example.com', 'password')
        .subscribe((response) => {
          expect(response).toEqual(mockLoginResponse);
          expect(tokenStorageSpy.saveToken).toHaveBeenCalledWith('mock-token');
          expect(tokenStorageSpy.saveUser).toHaveBeenCalledWith(mockUser);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/users/profile']);
        });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);
    });

    it('should handle registration failure when token is invalid', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(false);

      service.register('Test User', 'test@example.com', 'password').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(mockLoginResponse);

      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Error al registrar usuario',
        'Error'
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully and navigate to login', () => {
      // Setup initial token state
      tokenStorageSpy.getToken.and.returnValue('mock-token');

      // Setup token state after signOut
      tokenStorageSpy.signOut.and.callFake(() => {
        tokenStorageSpy.getToken.and.returnValue(null);
      });

      service.logout();

      expect(tokenStorageSpy.signOut).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should handle logout error when token persists', () => {
      // Setup initial token state
      tokenStorageSpy.getToken.and.returnValue('mock-token');

      // Setup token state after signOut to simulate error
      tokenStorageSpy.signOut.and.callFake(() => {
        tokenStorageSpy.getToken.and.returnValue('mock-token');
      });

      service.logout();

      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Error al cerrar sesión',
        'Error'
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token is valid', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(true);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when token is invalid', () => {
      tokenStorageSpy.isTokenValid.and.returnValue(false);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      tokenStorageSpy.getUser.and.returnValue(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user is stored', () => {
      tokenStorageSpy.getUser.and.returnValue(null);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return true when token is valid', (done) => {
      tokenStorageSpy.isTokenValid.and.returnValue(true);

      service.verifyToken().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should throw error when token is invalid', (done) => {
      tokenStorageSpy.isTokenValid.and.returnValue(false);

      service.verifyToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid or missing token');
          done();
        },
      });
    });
  });
});
