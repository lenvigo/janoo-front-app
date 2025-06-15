import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { VacationFormComponent } from './vacation-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { VacationService } from '../../../core/services/vacation.service';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

const PENDING = 'PENDING';
const APPROVED = 'APPROVED';
const REJECTED = 'REJECTED';
const mockVacation = {
  id: '1',
  user: '1',
  startDate: '1',
  endDate: '3',
  status: PENDING as 'PENDING',
  requestedAt: '1',
  manager: '2',
  respondedAt: '1',
  reason: '1',
};
describe('VacationFormComponent', () => {
  let component: VacationFormComponent;
  let fixture: ComponentFixture<VacationFormComponent>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockVacationService: jasmine.SpyObj<VacationService>;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockVacationService = jasmine.createSpyObj('VacationService', [
      'createVacation',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
      ],
      declarations: [VacationFormComponent],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: VacationService, useValue: mockVacationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.vacationForm).toBeDefined();
    expect(component.vacationForm.get('startDate')).toBeTruthy();
    expect(component.vacationForm.get('endDate')).toBeTruthy();
    expect(component.vacationForm.get('reason')).toBeTruthy();
  });

  it('should set error if endDate is before startDate', () => {
    const start = new Date();
    const end = new Date(start.getTime() - 24 * 60 * 60 * 1000); // 1 day before start
    component.vacationForm.setValue({
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      reason: 'Motivo suficiente',
    });
    component['validateDates']();
    expect(component.vacationForm.get('endDate')?.errors).toEqual({
      invalidDateRange: true,
    });
    expect(component.errorMessage).toContain(
      'La fecha de inicio debe ser anterior a la fecha de fin'
    );
  });

  it('should clear error if endDate is after startDate', () => {
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // 1 day after start
    component.vacationForm.setValue({
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      reason: 'Motivo suficiente',
    });
    component['validateDates']();
    expect(component.vacationForm.get('endDate')?.errors).toBeNull();
    expect(component.errorMessage).toBe('');
  });

  it('should navigate to /vacations on cancel', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/vacations']);
  });

  it('should clean up and navigate on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/vacations']);
  });
});
