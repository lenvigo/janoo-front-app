import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { VacationService } from '../../core/services/vacation.service';

@Component({
  selector: 'app-vacation-form',
  standalone: false,
  templateUrl: './vacation-form.component.html',
  styleUrls: ['./vacation-form.component.scss'],
})
export class VacationFormComponent implements OnInit {
  vacationForm!: FormGroup;
  isLoading = false;
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private vacationService: VacationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.vacationForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      type: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.vacationForm.invalid) {
      this.toastr.error(
        'Por favor, completa todos los campos correctamente',
        'Error'
      );
      return;
    }
    const { startDate, endDate } = this.vacationForm.value;
    const start = startDate instanceof Date ? startDate : startDate?.toDate?.();
    const end = endDate instanceof Date ? endDate : endDate?.toDate?.();
    if (new Date(endDate) < new Date(startDate)) {
      this.toastr.error(
        'La fecha de inicio debe ser anterior a la fecha de fin',
        'Error'
      );
      return;
    }

    this.isLoading = true;
    const vacationData = {
      ...this.vacationForm.value,
      status: 'PENDING' as const,
    };

    this.vacationService.createVacation(vacationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Solicitud de vacaciones enviada', 'Éxito');
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.toastr.error('Sesión expirada', 'Error');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(
            error.error?.error || 'Error al enviar la solicitud',
            'Error al enviar'
          );
        }
      },
    });
  }
}
