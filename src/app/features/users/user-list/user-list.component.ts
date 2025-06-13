import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'roles', 'actions'];
  users: User[] = [];
  dataSource: MatTableDataSource<User>;
  isLoading = false;
  isAdmin = false;
  isManager = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  // applyFilter(event: Event): void {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  // editUser(user: User): void {
  //   this.router.navigate(['/users', user.id, 'edit']);
  // }

  deleteUser(userId: string): void {
    if (this.isAdmin) {
      if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
          },
        });
      }
    } else {
      alert('No tiene permisos para eliminar usuarios.');
    }
  }
}
