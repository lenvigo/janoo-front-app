import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, defer } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Mock User y LoginResponse
const mockUser = {
  id: '1',
  name: 'Test',
  email: 'test@mail.com',
  password: '123456',
  roles: ['user'],
};
const mockLoginResponse = defer(() =>
  Promise.resolve({ token: 'fake-token', user: mockUser })
);

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    //authServiceSpy.login.and.returnValue(mockLoginResponse);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
      ],
      declarations: [RegisterComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.value).toEqual({
      name: '',
      email: '',
      password: '',
    });
  });

  it('should mark form as invalid if fields are empty', () => {
    component.registerForm.setValue({ name: '', email: '', password: '' });
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    component.registerForm.setValue({ name: '', email: '', password: '' });
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call AuthService.register and show success toastr on successful registration', fakeAsync(() => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@mail.com',
      password: '123456',
    });
    // Devuelve el objeto esperado por el modelo
    authServiceSpy.register.and.returnValue(mockLoginResponse);

    component.onSubmit();
    expect(component.isLoading).toBeTrue();
    tick();
    expect(authServiceSpy.register).toHaveBeenCalledWith(
      'Test',
      'test@mail.com',
      '123456'
    );
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Registro exitoso',
      'Bienvenido'
    );
  }));

  it('should show error toastr with server error message on registration error', fakeAsync(() => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@mail.com',
      password: '123456',
    });
    const errorResponse = { error: { error: 'Email already exists' } };
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Email already exists',
      'Registro fallido'
    );
  }));

  it('should show generic error toastr if error response does not contain error message', fakeAsync(() => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@mail.com',
      password: '123456',
    });
    const errorResponse = {};
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Registro fallido'
    );
  }));

  it('should set isLoading to true when submitting valid form and reset to false after response', fakeAsync(() => {
    component.registerForm.setValue({
      name: 'User',
      email: 'user@mail.com',
      password: 'abcdef',
    });
    authServiceSpy.register.and.returnValue(mockLoginResponse);

    component.onSubmit();
    expect(component.isLoading).toBeTrue();
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  it('should not call AuthService.register if form is invalid', () => {
    component.registerForm.setValue({ name: '', email: '', password: '' });
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should validate email format', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'invalid-email',
      password: '123456',
    });
    expect(component.registerForm.invalid).toBeTrue();
    expect(component.registerForm.get('email')?.errors?.['email']).toBeTrue();
  });

  it('should validate password minimum length', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@mail.com',
      password: '123',
    });
    expect(component.registerForm.invalid).toBeTrue();
    expect(
      component.registerForm.get('password')?.errors?.['minlength']
    ).toBeTruthy();
  });

  it('should not show toastr onSubmit if form is invalid', () => {
    component.registerForm.setValue({ name: '', email: '', password: '' });
    component.onSubmit();
    expect(toastrSpy.success).not.toHaveBeenCalled();
    expect(toastrSpy.error).not.toHaveBeenCalled();
  });
});
