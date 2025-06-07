import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IncidentService } from '../../core/services/incident.service';

@Component({
  selector: 'app-incident-form',
  standalone: false,
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss'],
})
export class IncidentFormComponent implements OnInit {
  incidentForm!: FormGroup;
  isLoading = false;

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
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      priority: ['MEDIUM', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) {
      this.toastr.error(
        'Por favor, completa todos los campos correctamente',
        'Error'
      );
      return;
    }

    this.isLoading = true;
    this.incidentService.createIncident(this.incidentForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Incidencia reportada correctamente', 'Éxito');
        this.router.navigate(['/incidents']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear la incidencia:', error);
        this.toastr.error(
          'Error al reportar la incidencia. Por favor, inténtalo de nuevo.',
          'Error'
        );
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/incidents']);
  }
}
