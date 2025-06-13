import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-management',
  standalone: false,
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
})
export class RoleManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  isAdmin = false;
  isManager = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadUsers();
  }

  private checkPermissions(): void {
    console.log('checkpermision init');
    const currentUser = this.authService.isLoggedIn$;
    console.log('checkpermision: currentUser' + currentUser);
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      console.log('checkpermision: currentUser: no hay permiso' + currentUser);
      return;
    }

    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();

    // if (!this.isAdmin || !this.isManager) {
    //   console.log('checkpermision: isAdmin' + this.isAdmin);
    //   console.log('checkpermision: isManager' + this.isManager);
    //   this.router.navigate(['/']);
    //   this.toastr.error(
    //     'No tienes permisos para acceder a esta página',
    //     'Error'
    //   );
    // }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.toastr.error('Error al cargar usuarios', 'Error');
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'role-admin';
      case 'MANAGER_ROLE':
        return 'role-manager';
      case 'USER_ROLE':
        return 'role-user';
      default:
        return '';
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'Administrador';
      case 'MANAGER_ROLE':
        return 'Manager';
      case 'USER_ROLE':
        return 'Usuario';
      default:
        return role;
    }
  }
}
