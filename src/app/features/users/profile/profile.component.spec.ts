import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef, TemplateRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  const userMock: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    img: 'avatar.png',
  } as User;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getProfile',
      'updateProfile',
      'isAdmin',
      'isManager',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProfileComponent],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: mockUserService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockUserService.isAdmin.and.returnValue(false);
    mockUserService.isManager.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to login if not authenticated', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should initialize form and load profile if authenticated', () => {
      mockUserService.getProfile.and.returnValue(of(userMock));
      component.ngOnInit();
      expect(component.profileForm).toBeDefined();
      expect(mockUserService.getProfile).toHaveBeenCalled();
      expect(component.isAdmin).toBe(false);
      expect(component.isManager).toBe(false);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.profileForm = TestBed.inject(FormBuilder).group({
        name: ['Test User'],
        email: ['test@example.com'],
        img: ['avatar.png'],
      });
      component.user = userMock;
    });

    it('should update profile on valid form', fakeAsync(() => {
      mockUserService.updateProfile.and.returnValue(of(userMock));
      component.onSubmit();
      tick();
      expect(component.user).toEqual(userMock);
      expect(component.isLoading).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Perfil actualizado',
        'Éxito'
      );
    }));

    it('should handle 401 error on update', fakeAsync(() => {
      mockUserService.updateProfile.and.returnValue(
        throwError({ status: 401 })
      );
      component.onSubmit();
      tick();
      expect(mockToastr.error).toHaveBeenCalledWith('Sesión expirada', 'Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
      expect(component.isLoading).toBe(false);
    }));

    it('should handle server error with error message', fakeAsync(() => {
      mockUserService.updateProfile.and.returnValue(
        throwError({ error: { error: 'Custom error' } })
      );
      component.onSubmit();
      tick();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Custom error',
        'Error al actualizar'
      );
      expect(component.isLoading).toBe(false);
    }));

    it('should handle generic server error', fakeAsync(() => {
      mockUserService.updateProfile.and.returnValue(
        throwError({ status: 500 })
      );
      component.onSubmit();
      tick();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Error del servidor',
        'Error al actualizar'
      );
      expect(component.isLoading).toBe(false);
    }));
  });
});
