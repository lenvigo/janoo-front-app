import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;
    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Registro exitoso', 'Bienvenido');
        // La redirección ya está manejada en el AuthService
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.error) {
          this.toastr.error(err.error.error, 'Registro fallido');
        } else {
          this.toastr.error('Error del servidor', 'Registro fallido');
        }
      },
    });
  }
}
