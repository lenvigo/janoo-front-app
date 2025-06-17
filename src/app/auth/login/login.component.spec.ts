import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
    roles: ['USER_ROLE'],
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'saveToken',
      'saveUser',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
      ],
      declarations: [LoginComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with email and password controls', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should not submit if the form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    fixture.detectChanges();
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('should call AuthService.login and show success toast on successful login', fakeAsync(() => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    authServiceSpy.login.and.returnValue(
      timer(100).pipe(map(() => ({ token: 'fake-token', user: mockUser })))
    );
    component.onSubmit();
    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();
    expect(authServiceSpy.login).toHaveBeenCalledWith(
      'test@example.com',
      '123456'
    );
    tick(100);
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Login successful',
      'Bienvenido'
    );
  }));

  it('should show specific error toast if error response has error.error', fakeAsync(() => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '1234568',
    });

    const errorResponse = {
      error: {
        error: 'Invalid credentials',
      },
    };
    authServiceSpy.login.and.returnValue(
      timer(100).pipe(
        map(() => {
          throw errorResponse;
        })
      )
    );
    fixture.detectChanges();
    component.onSubmit();
    tick(100);

    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Invalid credentials',
      'Login fallido'
    );
  }));

  it('should show generic error toast if error response does not have error.error', fakeAsync(() => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    const errorResponse = { error: {} };
    authServiceSpy.login.and.returnValue(
      timer(100).pipe(
        map(() => {
          throw errorResponse;
        })
      )
    );
    fixture.detectChanges();
    component.onSubmit();
    tick(100);

    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Login fallido'
    );
  }));
});
