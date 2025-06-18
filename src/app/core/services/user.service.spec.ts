import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { TokenStorageService } from './token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockToken = 'mock-token';
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    password: '123456',
    email: 'test@example.com',
    roles: ['USER_ROLE'],
  };

  beforeEach(() => {
    tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
      'getUser',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorageSpy.getToken.and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should get user profile', () => {
      service.getProfile().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      service.updateProfile(updateData).subscribe((user) => {
        expect(user).toEqual({ ...mockUser, ...updateData });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockUser, ...updateData });
    });
  });

  describe('listAll', () => {
    it('should get all users', () => {
      const mockUsers: User[] = [mockUser];

      service.listAll().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush(mockUsers);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      const userId = '1';

      service.deleteUser(userId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush(null);
    });
  });

  describe('role management', () => {
    it('should assign a role to a user', () => {
      const userId = '1';
      const role = 'ADMIN_ROLE';

      service.assignRole(userId, role).subscribe((user) => {
        expect(user).toEqual({ ...mockUser, roles: [...mockUser.roles, role] });
        expect(toastrSpy.success).toHaveBeenCalledWith(
          `Rol ${role} asignado correctamente`
        );
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/users/${userId}/roles`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      expect(req.request.body).toEqual({ role });
      req.flush({ ...mockUser, roles: [...mockUser.roles, role] });
    });

    it('should remove a role from a user', () => {
      const userId = '1';
      const role = 'USER_ROLE';

      service.removeRole(userId, role).subscribe((user) => {
        expect(user).toEqual({
          ...mockUser,
          roles: mockUser.roles.filter((r) => r !== role),
        });
        expect(toastrSpy.success).toHaveBeenCalledWith(
          `Rol ${role} eliminado correctamente`
        );
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/users/${userId}/roles/${role}`
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush({
        ...mockUser,
        roles: mockUser.roles.filter((r) => r !== role),
      });
    });
  });

  describe('role checks', () => {
    it('should return available roles', () => {
      expect(service.getAvailableRoles()).toEqual(['ADMIN', 'MANAGER', 'USER']);
    });

    it('should check if user has a specific role', () => {
      tokenStorageSpy.getUser.and.returnValue(mockUser);
      expect(service.hasRole('USER_ROLE')).toBeTrue();
      expect(service.hasRole('ADMIN_ROLE')).toBeFalse();
    });

    it('should check if user is admin', () => {
      tokenStorageSpy.getUser.and.returnValue({
        ...mockUser,
        roles: ['ADMIN_ROLE'],
      });
      expect(service.isAdmin()).toBeTrue();

      tokenStorageSpy.getUser.and.returnValue(mockUser);
      expect(service.isAdmin()).toBeFalse();
    });

    it('should check if user is manager', () => {
      tokenStorageSpy.getUser.and.returnValue({
        ...mockUser,
        roles: ['MANAGER_ROLE'],
      });
      expect(service.isManager()).toBeTrue();

      tokenStorageSpy.getUser.and.returnValue(mockUser);
      expect(service.isManager()).toBeFalse();
    });
  });

  describe('error handling', () => {
    it('should handle role assignment error', () => {
      const userId = '1';
      const role = 'ADMIN_ROLE';

      service.assignRole(userId, role).subscribe({
        error: () => {
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Error al asignar el rol'
          );
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/users/${userId}/roles`
      );
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle role removal error', () => {
      const userId = '1';
      const role = 'USER_ROLE';

      service.removeRole(userId, role).subscribe({
        error: () => {
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Error al eliminar el rol'
          );
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/users/${userId}/roles/${role}`
      );
      req.error(new ErrorEvent('Network error'));
    });
  });
});
