import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IncidentService } from '../../../core/services/incident.service';

@Component({
  selector: 'app-incident-form',
  standalone: false,
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss'],
})
export class IncidentFormComponent implements OnInit {
  incidentForm!: FormGroup;
  isLoading = false;
  priorities = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ];
  types = [
    { value: 'TECHNICAL', label: 'Técnica' },
    { value: 'HUMAN_RESOURCES', label: 'Recursos Humanos' },
    { value: 'FACILITIES', label: 'Instalaciones' },
    { value: 'OTHER', label: 'Otro' },
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.incidentForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      type: ['', [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.incidentForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }
    if (control.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength'].requiredLength;
      return `No debe exceder ${requiredLength} caracteres`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) {
      this.markFormGroupTouched(this.incidentForm);
      this.toastr.error(
        'Por favor, completa todos los campos correctamente',
        'Error'
      );
      return;
    }

    this.isLoading = true;
    this.incidentService.reportIncident(this.incidentForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Incidencia reportada correctamente', 'Éxito');
        this.router.navigate(['/incidents']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear la incidencia:', error);
        const errorMessage =
          error.error?.message ||
          'Error al reportar la incidencia. Por favor, inténtalo de nuevo.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    if (this.incidentForm.dirty) {
      if (
        confirm(
          '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.'
        )
      ) {
        this.router.navigate(['/incidents']);
      }
    } else {
      this.router.navigate(['/incidents']);
    }
  }
}
