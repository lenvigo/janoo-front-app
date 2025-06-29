import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { VacationService } from '../../../core/services/vacation.service';
import { CreateVacationDto } from '../../../core/models/vacation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vacation-form',
  standalone: false,
  templateUrl: './vacation-form.component.html',
  styleUrls: ['./vacation-form.component.scss'],
})
export class VacationFormComponent implements OnInit, OnDestroy {
  vacationForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private vacationService: VacationService
  ) {
    console.log('VacationFormComponent initialized');
  }

  ngOnInit(): void {
    console.log('Initializing vacation form');
    this.initForm();
  }

  ngOnDestroy(): void {
    console.log('Destroying vacation form component');
    this.destroy$.next();
    this.destroy$.complete();
    this.router.navigate(['/vacations']);
  }

  private initForm(): void {
    console.log('Initializing form controls');
    this.vacationForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    this.vacationForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });

    this.vacationForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  private validateDates(): void {
    const startDate = this.vacationForm.get('startDate')?.value;
    const endDate = this.vacationForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        this.vacationForm.get('endDate')?.setErrors({ invalidDateRange: true });
        this.errorMessage =
          'La fecha de inicio debe ser anterior a la fecha de fin';
      } else {
        this.vacationForm.get('endDate')?.setErrors(null);
        this.errorMessage = '';
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/vacations']);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.vacationForm.invalid) {
      this.toastr.error(
        'Por favor, completa todos los campos correctamente',
        'Error'
      );
      return;
    }

    const formValue = this.vacationForm.value;
    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);

    if (endDate < startDate) {
      this.errorMessage =
        'La fecha de inicio debe ser anterior a la fecha de fin';
      return;
    }

    this.isLoading = true;
    const vacationData: CreateVacationDto = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason: formValue.reason,
    };

    this.vacationService
      .createVacation(vacationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('Solicitud de vacaciones enviada', 'Éxito');
          this.vacationForm.reset();
          this.router.navigate(['/vacations']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        },
      });
  }
}
