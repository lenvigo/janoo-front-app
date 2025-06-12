import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Test User',
      password: '123456',
      email: 'test@example.com',
      roles: ['USER'],
    },
  ];

  beforeEach(async () => {
    const userService = jasmine.createSpyObj('UserService', [
      'listAll',
      'deleteUser',
    ]);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userServiceSpy.listAll.and.returnValue(of(mockUsers));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(userServiceSpy.listAll).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
  });

  it('should handle error when loading users', () => {
    userServiceSpy.listAll.and.returnValue(
      throwError(() => new Error('Test error'))
    );
    component.loadUsers();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar usuarios',
      'Error'
    );
  });

  it('should delete user successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    userServiceSpy.deleteUser.and.returnValue(of(void 0));
    component.deleteUser('1');
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('1');
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Usuario eliminado',
      'Éxito'
    );
  });

  it('should handle error when deleting user', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    userServiceSpy.deleteUser.and.returnValue(
      throwError(() => ({ error: { error: 'Test error' } }))
    );
    component.deleteUser('1');
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Test error',
      'Error al eliminar'
    );
  });
});
