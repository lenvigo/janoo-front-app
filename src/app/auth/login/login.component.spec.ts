import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoginResponse } from '../../core/models/login-response';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockResponse: LoginResponse = {
    token: 'test-token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['USER'],
    },
  };

  beforeEach(async () => {
    const authService = jasmine.createSpyObj('AuthService', ['login']);
    const tokenStorage = jasmine.createSpyObj('TokenStorageService', [
      'saveToken',
      'saveUser',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authService },
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    tokenStorageSpy = TestBed.inject(
      TokenStorageService
    ) as jasmine.SpyObj<TokenStorageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: '12345',
    });
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should submit form and handle successful login', () => {
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(
      'test@example.com',
      '123456'
    );
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Login successful',
      'Bienvenido'
    );
  });

  it('should handle login error with server error message', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { error: 'Invalid credentials' } }))
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Invalid credentials',
      'Login fallido'
    );
  });

  it('should handle login error with generic error message', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Login fallido'
    );
  });
});
