import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  displayedColumns: string[] = ['name', 'email', 'roles', 'actions'];

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.listAll().subscribe({
      next: (users) => {
        this.isLoading = false;
        this.users = users;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error al cargar usuarios', 'Error');
      },
    });
  }

  deleteUser(id: string): void {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) {
      return;
    }
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toastr.success('Usuario eliminado', 'Éxito');
        this.loadUsers();
      },
      error: (err) => {
        if (err.error?.error) {
          this.toastr.error(err.error.error, 'Error al eliminar');
        } else {
          this.toastr.error('Error del servidor', 'Error al eliminar');
        }
      },
    });
  }
}
