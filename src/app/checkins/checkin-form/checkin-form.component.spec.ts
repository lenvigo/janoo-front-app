import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckinFormComponent } from './checkin-form.component';
import { CheckinService } from '../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Checkin } from '../../core/models/checkin';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CheckinFormComponent', () => {
  let component: CheckinFormComponent;
  let fixture: ComponentFixture<CheckinFormComponent>;
  let checkinServiceSpy: jasmine.SpyObj<CheckinService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const today = new Date();
  const mockCheckins: Checkin[] = [
    {
      id: '1',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      type: 'IN',
      timestamp: today.toISOString(),
    },
  ];

  beforeEach(async () => {
    const checkinService = jasmine.createSpyObj('CheckinService', [
      'listAll',
      'create',
    ]);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CheckinFormComponent],
      imports: [MatTableModule, MatPaginatorModule, MatSortModule],
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
    fixture = TestBed.createComponent(CheckinFormComponent);
    component = fixture.componentInstance;
    checkinServiceSpy.listAll.and.returnValue(of(mockCheckins));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load today checkins on init', () => {
    expect(checkinServiceSpy.listAll).toHaveBeenCalled();
    expect(component.todayCheckins).toEqual(mockCheckins);
    expect(component.lastCheckin).toEqual(mockCheckins[0]);
  });

  it('should handle error when loading checkins', () => {
    checkinServiceSpy.listAll.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.loadTodayCheckins();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al cargar fichajes',
      'Error'
    );
  });

  it('should handle authentication error when loading checkins', () => {
    checkinServiceSpy.listAll.and.returnValue(
      throwError(() => ({ status: 401 }))
    );
    component.loadTodayCheckins();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Sesión expirada',
      'Error de autenticación'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should mark entry successfully', () => {
    checkinServiceSpy.create.and.returnValue(of(mockCheckins[0]));
    component.mark('IN');
    expect(checkinServiceSpy.create).toHaveBeenCalledWith('IN');
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Fichaje Entrada registrado.',
      'Éxito'
    );
  });

  it('should not allow exit without entry', () => {
    component.lastCheckin = null;
    component.mark('OUT');
    expect(checkinServiceSpy.create).not.toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Primero debes marcar una entrada antes de la salida.',
      'Operación no permitida'
    );
  });

  it('should handle error when marking checkin', () => {
    checkinServiceSpy.create.and.returnValue(
      throwError(() => ({ error: { error: 'Test error' } }))
    );
    component.mark('IN');
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Test error',
      'Error al fichar'
    );
  });

  it('should handle authentication error when marking checkin', () => {
    checkinServiceSpy.create.and.returnValue(
      throwError(() => ({ status: 401 }))
    );
    component.mark('IN');
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Sesión expirada',
      'Error de autenticación'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
