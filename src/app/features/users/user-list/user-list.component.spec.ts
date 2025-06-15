import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUsers: User[] = [
    { id: '1', name: 'User One', email: 'one@test.com', roles: ['admin'] },
    { id: '2', name: 'User Two', email: 'two@test.com', roles: ['manager'] },
  ] as User[];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllUsers',
      'deleteUser',
      'isAdmin',
      'isManager',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userServiceSpy.isAdmin.and.returnValue(true);
    userServiceSpy.isManager.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAdmin and isManager on ngOnInit', () => {
    userServiceSpy.isAdmin.and.returnValue(true);
    userServiceSpy.isManager.and.returnValue(true);
    userServiceSpy.getAllUsers.and.returnValue(of([]));
    component.ngOnInit();
    expect(component.isAdmin).toBeTrue();
    expect(component.isManager).toBeTrue();
  });

  it('should load users successfully', fakeAsync(() => {
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.loadUsers();
    tick();
    expect(component.users).toEqual(mockUsers);
    expect(component.dataSource.data).toEqual(mockUsers);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading users', fakeAsync(() => {
    const error = new Error('Failed to load');
    spyOn(console, 'error');
    userServiceSpy.getAllUsers.and.returnValue(throwError(() => error));
    component.loadUsers();
    tick();
    expect(console.error).toHaveBeenCalledWith('Error loading users:', error);
    expect(component.isLoading).toBeFalse();
  }));


  it('should not call deleteUser if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.isAdmin = true;
    component.deleteUser('1');
    expect(userServiceSpy.deleteUser).not.toHaveBeenCalled();
  });

  it('should alert if not isAdmin', () => {
    spyOn(window, 'alert');
    component.isAdmin = false;
    component.deleteUser('1');
    expect(window.alert).toHaveBeenCalledWith(
      'No tiene permisos para eliminar usuarios.'
    );
  });

  it('should handle error when deleting user', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    const error = new Error('Delete failed');
    spyOn(console, 'error');
    userServiceSpy.deleteUser.and.returnValue(throwError(() => error));
    component.isAdmin = true;
    component.deleteUser('1');
    tick();
    expect(console.error).toHaveBeenCalledWith('Error deleting user:', error);
  }));
});
