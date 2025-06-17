import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleManagementComponent } from './role-management.component';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'User1',
    password: '',
    email: 'user1@test.com',
    roles: ['USER_ROLE'],
  },
  {
    id: '2',
    name: 'Admin',
    password: '',
    email: 'admin@test.com',
    roles: ['ADMIN_ROLE'],
  },
];

describe('RoleManagementComponent', () => {
  let component: RoleManagementComponent;
  let fixture: ComponentFixture<RoleManagementComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllUsers',
      'isAdmin',
      'isManager',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoggedIn$: true,
    });

    await TestBed.configureTestingModule({
      declarations: [RoleManagementComponent],
      imports: [
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUsers and set users on success', () => {
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.loadUsers();
    expect(userServiceSpy.getAllUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loadUsers fails', () => {
    userServiceSpy.getAllUsers.and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.loadUsers();
    expect(userServiceSpy.getAllUsers).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar usuarios',
      'Error'
    );
  });

  it('should check permissions and set isAdmin/isManager', () => {
    userServiceSpy.isAdmin.and.returnValue(true);
    userServiceSpy.isManager.and.returnValue(false);
    userServiceSpy.getAllUsers.and.returnValue(of([]));
    component.ngOnInit();
    expect(component.isAdmin).toBeTrue();
    expect(component.isManager).toBeFalse();
  });

  it('should redirect to login if not logged in', () => {
    Object.defineProperty(authServiceSpy, 'isLoggedIn$', { value: false });
    userServiceSpy.getAllUsers.and.returnValue(of([]));
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should return correct role badge class', () => {
    expect(component.getRoleBadgeClass('ADMIN_ROLE')).toBe('role-admin');
    expect(component.getRoleBadgeClass('MANAGER_ROLE')).toBe('role-manager');
    expect(component.getRoleBadgeClass('USER_ROLE')).toBe('role-user');
    expect(component.getRoleBadgeClass('OTHER')).toBe('');
  });

  it('should return correct role display name', () => {
    expect(component.getRoleDisplayName('ADMIN_ROLE')).toBe('Administrador');
    expect(component.getRoleDisplayName('MANAGER_ROLE')).toBe('Manager');
    expect(component.getRoleDisplayName('USER_ROLE')).toBe('Usuario');
    expect(component.getRoleDisplayName('OTHER')).toBe('OTHER');
  });

  it('should show admin controls if user is ADMIN', () => {
    userServiceSpy.isAdmin.and.returnValue(true);
    userServiceSpy.isManager.and.returnValue(false);
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.isAdmin).toBeTrue();
    // Aquí podrías buscar un elemento del template que solo se muestre para admin
    // Por ejemplo:
    // const compiled = fixture.debugElement.nativeElement;
    // expect(compiled.querySelector('.admin-controls')).toBeTruthy();
  });

  it('should show manager controls if user is MANAGER', () => {
    userServiceSpy.isAdmin.and.returnValue(false);
    userServiceSpy.isManager.and.returnValue(true);
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.isManager).toBeTrue();
    // Aquí podrías buscar un elemento del template que solo se muestre para manager
    // Por ejemplo:
    // const compiled = fixture.debugElement.nativeElement;
    // expect(compiled.querySelector('.manager-controls')).toBeTruthy();
  });

  it('should not show admin or manager controls if user is neither', () => {
    userServiceSpy.isAdmin.and.returnValue(false);
    userServiceSpy.isManager.and.returnValue(false);
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.isAdmin).toBeFalse();
    expect(component.isManager).toBeFalse();
    // const compiled = fixture.debugElement.nativeElement;
    // expect(compiled.querySelector('.admin-controls')).toBeNull();
    // expect(compiled.querySelector('.manager-controls')).toBeNull();
  });

  it('should show special badge for ADMIN_ROLE', () => {
    const badgeClass = component.getRoleBadgeClass('ADMIN_ROLE');
    expect(badgeClass).toBe('role-admin');
  });

  it('should show special badge for MANAGER_ROLE', () => {
    const badgeClass = component.getRoleBadgeClass('MANAGER_ROLE');
    expect(badgeClass).toBe('role-manager');
  });

  it('should show special badge for USER_ROLE', () => {
    const badgeClass = component.getRoleBadgeClass('USER_ROLE');
    expect(badgeClass).toBe('role-user');
  });
});
