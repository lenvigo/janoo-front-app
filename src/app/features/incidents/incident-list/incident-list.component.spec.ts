import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { IncidentListComponent } from './incident-list.component';
import { IncidentService } from '../../../core/services/incident.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { of, Subject, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Incident } from '../../../core/models/incident';
import { User } from '../../../core/models/user';

const OPEN = 'OPEN';
const RESOLVED = 'RESOLVED';
const CLOSED = 'CLOSED';

const mockIncident = {
  id: '1',
  user: '1',
  title: 'Valid Title',
  description: 'Valid description for incident',
  status: OPEN as 'OPEN', // Assuming OPEN is the first status
  createdAt: '1',
  managerId: '2',
  resolvedAt: '1',
  managerComment: 'Valid comment for incident',
};
const mockUsers = [
  {
    id: '1',
    name: 'Alice',
    password: '1234',
    email: '123@123com',
    roles: ['USER'],
  },
  {
    id: '2',
    name: 'Bob',
    password: '1234',
    email: '123@123com',
    roles: ['USER'],
  },
];

describe('IncidentListComponent', () => {
  let component: IncidentListComponent;
  let fixture: ComponentFixture<IncidentListComponent>;
  let mockIncidentService: jasmine.SpyObj<IncidentService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockIncidentService = jasmine.createSpyObj('IncidentService', [
      'getIncidents',
      'resolveIncident',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockUserService = jasmine.createSpyObj('UserService', ['getAllUsers']);

    mockRoute = {
      data: of({ view: 'own' }),
    };

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatFormFieldModule,
        MatTableModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
      ],
      declarations: [IncidentListComponent],
      providers: [
        { provide: IncidentService, useValue: mockIncidentService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: ToastrService, useValue: mockToastr },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkUserRoles', () => {
    it('should set isManager and isAdmin based on user roles', () => {
      mockAuthService.getCurrentUser.and.returnValue({
        id: 'test',
        name: 'Test User',
        password: '1234',
        email: 'test@test.com',
        roles: ['MANAGER_ROLE', 'ADMIN_ROLE'],
      } as User);
      (component as any).checkUserRoles();
      expect(component.isManager).toBeTrue();
      expect(component.isAdmin).toBeTrue();
    });

    it('should set isManager and isAdmin to false if user has no roles', () => {
      mockAuthService.getCurrentUser.and.returnValue({
        id: 'test',
        name: 'Test User',
        password: '1234',
        email: 'test@test.com',
        roles: [],
      } as User);
      (component as any).checkUserRoles();
      expect(component.isManager).toBeFalse();
      expect(component.isAdmin).toBeFalse();
    });
  });
  describe('checkViewMode', () => {
    it('should set viewMode from route data', () => {
      component.viewMode = 'own';
      (component as any).checkViewMode();
      expect(component.viewMode).toBe('own');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct status class', () => {
      expect(component.getStatusClass('OPEN')).toBe('status-open');
    });
  });

  describe('filterByStatus', () => {
    it('should set dataSource.filter', () => {
      component.filterByStatus('OPEN');
      expect(component.dataSource.filter).toBe('open');
    });
  });

  describe('getStatusText', () => {
    it('should return correct status text', () => {
      expect(component.getStatusText('OPEN')).toBe('En Progreso');
      expect(component.getStatusText('RESOLVED')).toBe('Resuelto');
      expect(component.getStatusText('CLOSED')).toBe('Cerrado');
      expect(component.getStatusText('OTHER')).toBe('eN pROGRESO');
    });
  });

  describe('openResolveDialog', () => {
    it('should open dialog and call resolveIncident if result', fakeAsync(() => {
      const incident = { id: '1' } as Incident;
      const afterClosed$ = of('manager comment');
      mockDialog.open.and.returnValue({
        afterClosed: () => afterClosed$,
      } as any);
      spyOn(component, 'resolveIncident');
      component.openResolveDialog(incident);
      tick();
      expect(component.resolveIncident).toHaveBeenCalledWith(
        '1',
        'manager comment'
      );
    }));

    it('should not call resolveIncident if dialog result is falsy', fakeAsync(() => {
      const incident = { id: '1' } as Incident;
      const afterClosed$ = of(null);
      mockDialog.open.and.returnValue({
        afterClosed: () => afterClosed$,
      } as any);
      spyOn(component, 'resolveIncident');
      component.openResolveDialog(incident);
      tick();
      expect(component.resolveIncident).not.toHaveBeenCalled();
    }));
  });

  describe('resolveIncident', () => {
    it('should call incidentService.resolveIncident and reload incidents on success', fakeAsync(() => {
      mockIncidentService.resolveIncident.and.returnValue(of(mockIncident));
      spyOn(component, 'loadIncidents');
      component.resolveIncident('1', 'comment');
      tick();
      expect(component.loadIncidents).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Incidencia resuelta correctamente',
        'Éxito'
      );
    }));

    it('should handle error on resolveIncident', fakeAsync(() => {
      spyOn(console, 'error');
      mockIncidentService.resolveIncident.and.returnValue(
        throwError(() => new Error('fail'))
      );
      component.resolveIncident('1', 'comment');
      tick();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('createIncident', () => {
    it('should navigate to /incidents/new', () => {
      component.createIncident();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/incidents/new']);
    });
  });

  describe('canManageIncidents', () => {
    it('should return true if isManager or isAdmin', () => {
      component.isManager = true;
      expect(component.canManageIncidents()).toBeTrue();
      component.isManager = false;
      component.isAdmin = true;
      expect(component.canManageIncidents()).toBeTrue();
      component.isAdmin = false;
      expect(component.canManageIncidents()).toBeFalse();
    });
  });

  describe('canDeleteIncidents', () => {
    it('should return true if isAdmin', () => {
      component.isAdmin = true;
      expect(component.canDeleteIncidents()).toBeTrue();
      component.isAdmin = false;
      expect(component.canDeleteIncidents()).toBeFalse();
    });
  });

  describe('viewIncident', () => {
    it('should navigate to incident detail', () => {
      const incident = { id: '123' } as Incident;
      component.viewIncident(incident);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/incidents', '123']);
    });
  });
});
