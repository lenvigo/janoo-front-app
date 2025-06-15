import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CheckinFormComponent } from './checkin-form.component';
import { CheckinService } from '../../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { Checkin } from '../../../core/models/checkin';
import { MatDividerModule } from '@angular/material/divider';

describe('CheckinFormComponent', () => {
  let component: CheckinFormComponent;
  let fixture: ComponentFixture<CheckinFormComponent>;
  let checkinServiceSpy: jasmine.SpyObj<CheckinService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    checkinServiceSpy = jasmine.createSpyObj('CheckinService', [
      'listAll',
      'create',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MatDividerModule],
      declarations: [CheckinFormComponent],
      providers: [
        { provide: CheckinService, useValue: checkinServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckinFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadTodayCheckins', () => {
      spyOn(component, 'loadTodayCheckins');
      component.ngOnInit();
      expect(component.loadTodayCheckins).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$', () => {
      const destroy$ = (component as any).destroy$ as Subject<void>;
      spyOn(destroy$, 'next').and.callThrough();
      spyOn(destroy$, 'complete').and.callThrough();
      component.ngOnDestroy();
      expect(destroy$.next).toHaveBeenCalled();
      expect(destroy$.complete).toHaveBeenCalled();
    });
  });

  describe('loadTodayCheckins', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayCheckin: Checkin = {
      id: '1',
      user: '1',
      type: 'IN',
      timestamp: today.toISOString(),
    } as Checkin;

    const yesterdayCheckin: Checkin = {
      id: '2',
      user: '1',
      type: 'OUT',
      timestamp: yesterday.toISOString(),
    } as Checkin;

    it('should filter today checkins and set lastCheckin', fakeAsync(() => {
      checkinServiceSpy.listAll.and.returnValue(
        of([yesterdayCheckin, todayCheckin])
      );
      component.loadTodayCheckins();
      tick();
      expect(component.todayCheckins.length).toBe(1);
      expect(component.todayCheckins[0]).toEqual(todayCheckin);
      expect(component.lastCheckin).toEqual(todayCheckin);
      expect(component.isLoading).toBeFalse();
    }));

    it('should set lastCheckin to null if no today checkins', fakeAsync(() => {
      checkinServiceSpy.listAll.and.returnValue(of([yesterdayCheckin]));
      component.loadTodayCheckins();
      tick();
      expect(component.todayCheckins.length).toBe(0);
      expect(component.lastCheckin).toBeNull();
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error and show toastr', fakeAsync(() => {
      checkinServiceSpy.listAll.and.returnValue(
        throwError(() => ({ message: 'Some error' }))
      );
      component.loadTodayCheckins();
      tick();
      expect(toastrSpy.error).toHaveBeenCalledWith('Some error', 'Error');
      expect(component.isLoading).toBeFalse();
    }));

    it('should redirect to login if session expired', fakeAsync(() => {
      checkinServiceSpy.listAll.and.returnValue(
        throwError(() => ({ message: 'Sesión expirada' }))
      );
      component.loadTodayCheckins();
      tick();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('mark', () => {
    beforeEach(() => {
      component.isLoading = false;
      component.lastCheckin = null;
    });

    it('should not mark if isLoading is true', () => {
      component.isLoading = true;
      component.mark('IN');
      expect(checkinServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should show error if marking OUT without previous IN', () => {
      component.lastCheckin = null;
      component.mark('OUT');
      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Primero debes marcar una entrada antes de la salida.',
        'Operación no permitida'
      );
      expect(checkinServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should show error if lastCheckin.type is not IN when marking OUT', () => {
      component.lastCheckin = {
        id: '1',
        user: '1',
        type: 'OUT',
        timestamp: new Date().toISOString(),
      } as Checkin;
      component.mark('OUT');
      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Primero debes marcar una entrada antes de la salida.',
        'Operación no permitida'
      );
      expect(checkinServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call checkinService.create and show success for IN', fakeAsync(() => {
      checkinServiceSpy.create.and.returnValue(
        of({
          id: '3',
          user: '1',
          type: 'IN',
          timestamp: new Date().toISOString(),
        })
      );
      spyOn(component, 'loadTodayCheckins');
      component.mark('IN');
      tick();
      expect(checkinServiceSpy.create).toHaveBeenCalledWith('IN');
      expect(toastrSpy.success).toHaveBeenCalledWith(
        'Fichaje Entrada registrado.',
        'Éxito'
      );
      expect(component.loadTodayCheckins).toHaveBeenCalled();
    }));

    it('should call checkinService.create and show success for OUT', fakeAsync(() => {
      component.lastCheckin = {
        id: '1',
        user: '1',
        type: 'IN',
        timestamp: new Date().toISOString(),
      } as Checkin;
      checkinServiceSpy.create.and.returnValue(
        of({
          id: '4',
          user: '1',
          type: 'OUT',
          timestamp: new Date().toISOString(),
        })
      );
      spyOn(component, 'loadTodayCheckins');
      component.mark('OUT');
      tick();
      expect(checkinServiceSpy.create).toHaveBeenCalledWith('OUT');
      expect(toastrSpy.success).toHaveBeenCalledWith(
        'Fichaje Salida registrado.',
        'Éxito'
      );
      expect(component.loadTodayCheckins).toHaveBeenCalled();
    }));

    it('should handle error on create and show toastr', fakeAsync(() => {
      component.lastCheckin = {
        id: '1',
        user: '1',
        type: 'IN',
        timestamp: new Date().toISOString(),
      } as Checkin;
      checkinServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Create error' }))
      );
      component.mark('OUT');
      tick();
      expect(toastrSpy.error).toHaveBeenCalledWith('Create error', 'Error');
      expect(component.isLoading).toBeFalse();
    }));

    it('should redirect to login if session expired on create', fakeAsync(() => {
      component.lastCheckin = {
        id: '1',
        user: '1',
        type: 'IN',
        timestamp: new Date().toISOString(),
      } as Checkin;
      checkinServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Sesión expirada' }))
      );
      component.mark('OUT');
      tick();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });
});
