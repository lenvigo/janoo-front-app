import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoginResponse } from '../../core/models/login-response';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
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
    const authService = jasmine.createSpyObj('AuthService', ['register']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with empty values', () => {
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.registerForm.get('name');
    const emailControl = component.registerForm.get('email');
    const passwordControl = component.registerForm.get('password');

    expect(nameControl?.valid).toBeFalsy();
    expect(emailControl?.valid).toBeFalsy();
    expect(passwordControl?.valid).toBeFalsy();

    nameControl?.setValue('Test User');
    emailControl?.setValue('test@example.com');
    passwordControl?.setValue('123456');

    expect(nameControl?.valid).toBeTruthy();
    expect(emailControl?.valid).toBeTruthy();
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.registerForm.setValue({
      name: '',
      email: 'invalid-email',
      password: '12345',
    });
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should submit form and handle successful registration', () => {
    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.registerForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      '123456'
    );
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Registro exitoso',
      'Bienvenido'
    );
  });

  it('should handle registration error with server error message', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { error: 'Email already exists' } }))
    );

    component.registerForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Email already exists',
      'Registro fallido'
    );
  });

  it('should handle registration error with generic error message', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    component.registerForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });
    component.onSubmit();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Registro fallido'
    );
  });
});
