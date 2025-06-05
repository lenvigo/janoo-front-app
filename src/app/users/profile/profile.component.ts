import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';

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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      img: [''],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.isLoading = false;
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          img: user.img || '',
        });
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error al cargar perfil', 'Error');
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }
    this.isLoading = true;
    const { name, email, img } = this.profileForm.value;
    this.userService.updateProfile({ name, email, img }).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.user = updatedUser;
        this.toastr.success('Perfil actualizado', 'Éxito');
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.error) {
          this.toastr.error(err.error.error, 'Error al actualizar');
        } else {
          this.toastr.error('Error del servidor', 'Error al actualizar');
        }
      },
    });
  }
}
