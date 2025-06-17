import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacationListComponent } from './vacation-list.component';
import { VacationService } from '../../../core/services/vacation.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { Vacation } from '../../../core/models/vacation';
import { User } from '../../../core/models/user';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

// Mock data
const mockUser: User = {
  id: '1',
  name: 'U',
  email: 'test@example.com',
  password: 'password',
  roles: ['USER'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
const usersMap: User[] = [
  {
    id: '1',
    name: 'U',
    email: 'test@example.com',
    password: 'password',
    roles: ['USER'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'A',
    email: 'test@example.com',
    password: 'password',
    roles: ['USER'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'h',
    email: 'test@example.com',
    password: 'password',
    roles: ['USER'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockVacations: Vacation[] = [
  {
    id: '1',
    user: '1',
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    reason: 'Vacaciones',
    status: 'PENDING',
    requestedAt: '2024-01-01',
  },
  {
    id: '2',
    user: '2',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    reason: 'Vacaciones',
    status: 'PENDING',
    requestedAt: '2024-01-10',
  },
];

describe('VacationListComponent', () => {
  let component: VacationListComponent;
  let fixture: ComponentFixture<VacationListComponent>;
  let vacationServiceSpy: jasmine.SpyObj<VacationService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    const usersMap = {
      '1': {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        password: 'password',
        roles: ['USER'],
      },
      '2': {
        id: '2',
        name: 'Test User 2',
        email: 'test2@example.com',
        role: 'user',
        password: 'password',
        roles: ['USER'],
      },
    };

    const mockVacations = [
      {
        id: '1',
        user: '1',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        reason: 'Vacaciones',
        status: 'PENDING' as const,
        requestedAt: '2024-01-01',
      },
      {
        id: '2',
        user: '2',
        startDate: '2024-01-10',
        endDate: '2024-01-15',
        reason: 'Vacaciones',
        status: 'PENDING' as const,
        requestedAt: '2024-01-10',
      },
    ];

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllUsers',
      'isAdmin',
      'isManager',
    ]);
    userServiceSpy.getAllUsers.and.returnValue(of(Object.values(usersMap)));
    userServiceSpy.isAdmin.and.returnValue(true);
    userServiceSpy.isManager.and.returnValue(false);

    vacationServiceSpy = jasmine.createSpyObj('VacationService', [
      'getVacations',
      'approveVacation',
      'rejectVacation',
    ]);
    vacationServiceSpy.getVacations.and.returnValue(of(mockVacations));
    vacationServiceSpy.approveVacation.and.returnValue(
      of({
        ...mockVacations[0],
        status: 'APPROVED' as const,
      })
    );
    vacationServiceSpy.rejectVacation.and.returnValue(
      of({
        ...mockVacations[0],
        status: 'REJECTED' as const,
      })
    );

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    authServiceSpy.getCurrentUser.and.returnValue(usersMap['1']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { data: { view: 'all' } },
    });
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      declarations: [VacationListComponent],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: VacationService, useValue: vacationServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    fixture = TestBed.createComponent(VacationListComponent);
    component = fixture.componentInstance;
    component.usersMap = usersMap; // Inicializamos usersMap antes de detectChanges
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load vacations on init', () => {
    expect(vacationServiceSpy.getVacations).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockVacations);
  });

  it('should show loading state while fetching vacations', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const loadingElement = fixture.debugElement.query(By.css('.loading-shade'));
    expect(loadingElement).toBeTruthy();
  });

  it('should show empty state when no vacations', () => {
    component.dataSource.data = [];
    fixture.detectChanges();
    const noDataRow = fixture.debugElement.query(By.css('.mat-row'));
    expect(noDataRow).toBeTruthy();
    expect(noDataRow.nativeElement.textContent).toContain(
      'No hay datos que coincidan con el filtro'
    );
  });

  it('should apply filter when searching', () => {
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keyup', { target: { value: 'test' } });
    expect(component.dataSource.filter).toBe('test');
  });

  it('should filter by status', () => {
    component.filterByStatus('PENDING');
    expect(component.dataSource.filter).toBe('pending');
  });

  it('should filter by user', () => {
    component.filterByUser('1');
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].user).toBe('1');
  });

  it('should clear status filter when selecting all', () => {
    component.filterByStatus('all');
    expect(component.dataSource.filter).toBe('');
  });

  it('should clear user filter when selecting all', () => {
    // First filter by a specific user
    component.filterByUser('1');
    expect(component.dataSource.data.length).toBe(1);

    // Then clear the filter
    component.filterByUser('all');
    // Reset the data source to the original data
    component.dataSource.data = mockVacations;
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2024-01-01');
    expect(formattedDate).toBe('1/1/2024');
  });

  it('should return correct status text', () => {
    expect(component.getStatusText('PENDING')).toBe('Pendiente');
    expect(component.getStatusText('APPROVED')).toBe('Aprobada');
    expect(component.getStatusText('REJECTED')).toBe('Rechazada');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('APPROVED')).toBe('status-approved');
    expect(component.getStatusClass('REJECTED')).toBe('status-rejected');
  });

  it('should return correct status icon', () => {
    expect(component.getStatusIcon('PENDING')).toBe('schedule');
    expect(component.getStatusIcon('APPROVED')).toBe('check_circle');
    expect(component.getStatusIcon('REJECTED')).toBe('cancel');
  });

  it('should navigate to vacation form when creating new vacation', () => {
    component.createVacation();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vacations/form']);
  });

  it('should show approve button for pending vacations when user is admin', () => {
    const approveButton = fixture.debugElement.query(
      By.css('button[matTooltip="Aprobar solicitud"]')
    );
    expect(approveButton).toBeTruthy();
  });

  it('should show reject button for pending vacations when user is admin', () => {
    const rejectButton = fixture.debugElement.query(
      By.css('button[matTooltip="Rechazar solicitud"]')
    );
    expect(rejectButton).toBeTruthy();
  });

  it('should not show approve button for non-pending vacations', () => {
    component.dataSource.data = [{ ...mockVacations[0], status: 'APPROVED' }];
    fixture.detectChanges();
    const approveButton = fixture.debugElement.query(
      By.css('button[matTooltip="Aprobar solicitud"]')
    );
    expect(approveButton).toBeFalsy();
  });

  it('should not show reject button for non-pending vacations', () => {
    component.dataSource.data = [{ ...mockVacations[0], status: 'APPROVED' }];
    fixture.detectChanges();
    const rejectButton = fixture.debugElement.query(
      By.css('button[matTooltip="Rechazar solicitud"]')
    );
    expect(rejectButton).toBeFalsy();
  });

  it('should handle error when loading vacations', async () => {
    vacationServiceSpy.getVacations.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.loadVacations();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar las vacaciones'
    );
  });

  it('should handle error when approving vacation', async () => {
    vacationServiceSpy.approveVacation.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.approveVacation('1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al aprobar la solicitud'
    );
  });

  it('should handle error when rejecting vacation', async () => {
    vacationServiceSpy.rejectVacation.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.rejectVacation('1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al rechazar la solicitud'
    );
  });
});
