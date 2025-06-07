import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incident-form',
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class IncidentFormComponent implements OnInit {
  incidentForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
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
    // TODO: Implementar el servicio de incidencias
    console.log('Formulario de incidencia:', this.incidentForm.value);

    // Simulación de envío
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Incidencia reportada correctamente', 'Éxito');
      this.router.navigate(['/users/profile']);
    }, 1000);
  }
}
