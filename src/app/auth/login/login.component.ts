import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Handles the login form submission.
   *
   * - Validates the form and prevents submission if invalid.
   * - Sets the loading state while the authentication request is in progress.
   * - Calls the authentication service with the provided email and password.
   * - On successful login, displays a success toast notification.
   * - On error, displays an error toast notification with a specific or generic message.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.toastr.success('Login successful', 'Bienvenido');
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.error) {
          this.toastr.error(err.error.error, 'Login fallido');
        } else {
          this.toastr.error('Error del servidor', 'Login fallido');
        }
      },
    });
  }
}
