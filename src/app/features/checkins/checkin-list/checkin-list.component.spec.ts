import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CheckinListComponent } from './checkin-list.component';
import { CheckinService } from '../../../core/services/checkin.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { of, throwError, Subject } from 'rxjs';
import * as XLSX from 'xlsx';

describe('CheckinListComponent', () => {
  let component: CheckinListComponent;
  let fixture: ComponentFixture<CheckinListComponent>;
  let checkinServiceSpy: jasmine.SpyObj<CheckinService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const IN = 'IN';
  const OUT = 'OUT';

  const mockCheckins = [
    {
      id: 'c1',
      user: '1',
      type: IN as 'IN',
      timestamp: '2024-06-01T10:00:00Z',
    },
    {
      id: 'c2',
      user: '2',
      type: OUT as 'OUT',
      timestamp: '2024-06-01T18:00:00Z',
    },
  ];

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

  beforeEach(async () => {
    checkinServiceSpy = jasmine.createSpyObj('CheckinService', [
      'listAll',
      'getUserCheckins',
    ]);
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'isAdmin',
      'isManager',
      'getAllUsers',
      'listAll',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = new ActivatedRoute();
    activatedRoute.data = of({ view: 'own' });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatTableModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule,
      ],
      declarations: [CheckinListComponent],
      providers: [
        FormBuilder,
        { provide: CheckinService, useValue: checkinServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckinListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isAdmin, isManager, check view mode, load checkins, and load users if admin/manager', fakeAsync(() => {
      userServiceSpy.isAdmin.and.returnValue(true);
      userServiceSpy.isManager.and.returnValue(false);
      checkinServiceSpy.listAll.and.returnValue(of(mockCheckins));
      userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

      component.ngOnInit();
      tick();

      expect(component.isAdmin).toBeTrue();
      expect(component.isManager).toBeFalse();
      expect(Object.keys(component.usersMap).length).toBe(2);
      expect(component.usersMap['1'].name).toBe('Alice');
    }));

    it('should not call getAllUsers if not admin or manager', fakeAsync(() => {
      userServiceSpy.isAdmin.and.returnValue(false);
      userServiceSpy.isManager.and.returnValue(false);
      checkinServiceSpy.listAll.and.returnValue(of(mockCheckins));

      component.ngOnInit();
      tick();

      expect(userServiceSpy.getAllUsers).not.toHaveBeenCalled();
    }));
  });

  describe('filterByUser', () => {
    beforeEach(() => {
      component.checkins = [
        { id: 'c1', user: '1', type: IN, timestamp: '2024-06-01T10:00:00Z' },
        { id: 'c2', user: '2', type: OUT, timestamp: '2024-06-01T18:00:00Z' },
      ];
    });

    it('should show all checkins if userId is all', () => {
      component.filterByUser('all');
      expect(component.dataSource.data).toEqual(component.checkins);
    });

    it('should filter checkins by user', () => {
      component.filterByUser('1');
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].user).toBe('1');
    });
  });

  it('createCheckin should navigate to /checkins/new', () => {
    component.createCheckin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/checkins/new']);
  });
});
