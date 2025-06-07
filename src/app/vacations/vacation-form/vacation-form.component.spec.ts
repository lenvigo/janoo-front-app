import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacationFormComponent } from './vacation-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  VacationService,
  Vacation,
} from '../../core/services/vacation.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('VacationFormComponent', () => {
  let component: VacationFormComponent;
  let fixture: ComponentFixture<VacationFormComponent>;
  let vacationServiceSpy: jasmine.SpyObj<VacationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const vacationService = jasmine.createSpyObj('VacationService', [
      'createVacation',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [VacationFormComponent],
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        BrowserAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: VacationService, useValue: vacationService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    vacationServiceSpy = TestBed.inject(
      VacationService
    ) as jasmine.SpyObj<VacationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VacationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.vacationForm.get('startDate')?.value).toBe('');
    expect(component.vacationForm.get('endDate')?.value).toBe('');
    expect(component.vacationForm.get('type')?.value).toBe('');
    expect(component.vacationForm.get('reason')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const startDateControl = component.vacationForm.get('startDate');
    const endDateControl = component.vacationForm.get('endDate');
    const typeControl = component.vacationForm.get('type');
    const reasonControl = component.vacationForm.get('reason');

    expect(startDateControl?.valid).toBeFalsy();
    expect(endDateControl?.valid).toBeFalsy();
    expect(typeControl?.valid).toBeFalsy();
    expect(reasonControl?.valid).toBeFalsy();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    startDateControl?.setValue(today);
    endDateControl?.setValue(tomorrow);
    typeControl?.setValue('ANNUAL');
    reasonControl?.setValue('Necesito descansar');

    expect(startDateControl?.valid).toBeTruthy();
    expect(endDateControl?.valid).toBeTruthy();
    expect(typeControl?.valid).toBeTruthy();
    expect(reasonControl?.valid).toBeTruthy();
  });

  it('should validate reason minimum length', () => {
    const reasonControl = component.vacationForm.get('reason');
    reasonControl?.setValue('Corto');
    expect(reasonControl?.valid).toBeFalsy();
    expect(reasonControl?.errors?.['minlength']).toBeTruthy();

    reasonControl?.setValue(
      'Esta es una razón más larga para la solicitud de vacaciones'
    );
    expect(reasonControl?.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(vacationServiceSpy.createVacation).not.toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Por favor, completa todos los campos correctamente',
      'Error'
    );
  });

  // it('should not submit if end date is before start date', () => {
  //   const startDate = new Date('2024-06-10');
  //   const endDate = new Date('2024-06-09'); // anterior a startDate

  //   component.vacationForm.setValue({
  //     startDate,
  //     endDate,
  //     type: 'ANNUAL',
  //     reason: 'Vacaciones largas y necesarias',
  //   });
  //   // Forzar actualización de validadores
  //   component.vacationForm.markAllAsTouched();
  //   component.vacationForm.updateValueAndValidity();
  //   component.onSubmit();

  //   expect(toastrSpy.error).toHaveBeenCalledWith(
  //     'La fecha de inicio debe ser anterior a la fecha de fin',
  //     'Error'
  //   );
  // });

  it('should submit form with valid data', () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    vacationServiceSpy.createVacation.and.returnValue(
      of({
        id: 1,
        startDate,
        endDate,
        type: 'ANNUAL',
        reason: 'Test reason',
        status: 'PENDING',
        createdAt: new Date(),
      })
    );

    component.vacationForm.setValue({
      startDate,
      endDate,
      type: 'ANNUAL',
      reason: 'Test reason',
    });

    component.onSubmit();
    expect(vacationServiceSpy.createVacation).toHaveBeenCalledWith({
      startDate,
      endDate,
      type: 'ANNUAL',
      reason: 'Test reason',
      status: 'PENDING',
    });
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Solicitud de vacaciones enviada',
      'Éxito'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle error submitting form', () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    vacationServiceSpy.createVacation.and.returnValue(
      throwError(() => ({
        status: 500,
        error: { error: 'Error del servidor' },
      }))
    );

    component.vacationForm.setValue({
      startDate,
      endDate,
      type: 'ANNUAL',
      reason: 'Test reason',
    });

    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error del servidor',
      'Error al enviar'
    );
  });

  it('should handle unauthorized error submitting form', () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    vacationServiceSpy.createVacation.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.vacationForm.setValue({
      startDate,
      endDate,
      type: 'ANNUAL',
      reason: 'Test reason',
    });

    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalledWith('Sesión expirada', 'Error');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
