import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { of, Subject, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { User } from '../../core/models/user';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    img: 'test.jpg',
    roles: ['USER'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const userService = jasmine.createSpyObj('UserService', [
      'getProfile',
      'updateProfile',
    ]);
    const authService = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    userService.getProfile.and.returnValue(of(mockUser));
    authService.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should load user profile on init', () => {
    expect(userServiceSpy.getProfile).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
    expect(component.profileForm.get('img')?.value).toBe(mockUser.img);
  });

  it('should set isLoading to true when loading profile', () => {
    const subject = new Subject<any>();
    userServiceSpy.getProfile.and.returnValue(subject.asObservable());

    component.loadProfile();
    expect(component.isLoading).toBeTrue(); // Aquí debe ser true

    // Ahora resolvemos el observable
    subject.next(mockUser);
    subject.complete();
  });

  it('should set isLoading to false after profile is loaded', () => {
    // Reset the component to test loading state
    component = fixture.componentInstance;
    component.loadProfile();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error loading profile', () => {
    userServiceSpy.getProfile.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.loadProfile();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar perfil',
      'Error'
    );
    expect(component.isLoading).toBeFalse();
  });

  it('should handle unauthorized error loading profile', () => {
    userServiceSpy.getProfile.and.returnValue(
      throwError(() => ({ status: 401 }))
    );
    component.loadProfile();
    expect(toastrSpy.error).toHaveBeenCalledWith('Sesión expirada', 'Error');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(component.isLoading).toBeFalse();
  });

  it('should validate email format', () => {
    const emailControl = component.profileForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.profileForm.setValue({
      name: '',
      email: 'invalid-email',
      img: '',
    });
    component.onSubmit();
    expect(userServiceSpy.updateProfile).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', () => {
    const updatedUser: User = {
      ...mockUser,
      name: 'Updated Name',
      updatedAt: new Date().toISOString(),
    };
    userServiceSpy.updateProfile.and.returnValue(of(updatedUser));

    component.profileForm.setValue({
      name: 'Updated Name',
      email: 'test@example.com',
      img: 'new.jpg',
    });

    component.onSubmit();
    expect(userServiceSpy.updateProfile).toHaveBeenCalledWith({
      name: 'Updated Name',
      email: 'test@example.com',
      img: 'new.jpg',
    });
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Perfil actualizado',
      'Éxito'
    );
    expect(component.user).toEqual(updatedUser);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error updating profile', () => {
    userServiceSpy.updateProfile.and.returnValue(
      throwError(() => ({
        status: 500,
        error: { error: 'Error del servidor' },
      }))
    );

    component.profileForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      img: 'test.jpg',
    });

    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Error al actualizar'
    );
    expect(component.isLoading).toBeFalse();
  });

  it('should handle unauthorized error updating profile', () => {
    userServiceSpy.updateProfile.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.profileForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      img: 'test.jpg',
    });

    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalledWith('Sesión expirada', 'Error');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(component.isLoading).toBeFalse();
  });
});
