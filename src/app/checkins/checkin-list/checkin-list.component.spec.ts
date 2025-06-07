import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckinListComponent } from './checkin-list.component';
import { CheckinService } from '../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Checkin } from '../../core/models/checkin';

describe('CheckinListComponent', () => {
  let component: CheckinListComponent;
  let fixture: ComponentFixture<CheckinListComponent>;
  let checkinServiceSpy: jasmine.SpyObj<CheckinService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCheckins: Checkin[] = [
    {
      id: '1',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      type: 'IN',
      timestamp: '2024-03-20T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    const checkinService = jasmine.createSpyObj('CheckinService', ['listAll']);
    const toastr = jasmine.createSpyObj('ToastrService', ['error']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CheckinListComponent],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CheckinService, useValue: checkinService },
        { provide: ToastrService, useValue: toastr },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    checkinServiceSpy = TestBed.inject(
      CheckinService
    ) as jasmine.SpyObj<CheckinService>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinListComponent);
    component = fixture.componentInstance;
    checkinServiceSpy.listAll.and.returnValue(of(mockCheckins));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load checkins on init', () => {
    expect(checkinServiceSpy.listAll).toHaveBeenCalled();
    expect(component.checkins).toEqual(mockCheckins);
  });

  it('should handle error when loading checkins', () => {
    checkinServiceSpy.listAll.and.returnValue(
      throwError(() => new Error('Test error'))
    );
    component.loadAllCheckins();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar fichajes',
      'Error'
    );
  });
});
