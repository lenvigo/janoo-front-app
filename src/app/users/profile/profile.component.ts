import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user!: User;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('ProfileComponent initialized');
  }

  ngOnInit(): void {
    console.log('ProfileComponent - ngOnInit');
    if (!this.authService.isAuthenticated()) {
      console.error('ProfileComponent - User not authenticated');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      img: [''],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    console.log('ProfileComponent - Loading profile');
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (user) => {
        console.log('ProfileComponent - Profile loaded:', user);
        this.isLoading = false;
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          img: user.img || 'assets/default-avatar.png',
        });
      },
      error: (error) => {
        console.error('ProfileComponent - Error loading profile:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.toastr.error('Sesión expirada', 'Error');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error('Error al cargar perfil', 'Error');
        }
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      console.log('ProfileComponent - Form invalid');
      return;
    }

    console.log('ProfileComponent - Submitting form');
    const { name, email, img } = this.profileForm.value;
    this.isLoading = true;
    this.userService.updateProfile({ name, email, img }).subscribe({
      next: (updatedUser) => {
        console.log('ProfileComponent - Profile updated:', updatedUser);
        this.isLoading = false;
        this.user = updatedUser;
        this.toastr.success('Perfil actualizado', 'Éxito');
      },
      error: (error) => {
        console.error('ProfileComponent - Error updating profile:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.toastr.error('Sesión expirada', 'Error');
          this.router.navigate(['/auth/login']);
        } else if (error.error?.error) {
          this.toastr.error(error.error.error, 'Error al actualizar');
        } else {
          this.toastr.error('Error del servidor', 'Error al actualizar');
        }
      },
    });
  }
}
