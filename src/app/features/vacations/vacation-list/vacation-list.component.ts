import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Vacation } from '../../../core/models/vacation';
import { VacationService } from '../../../core/services/vacation.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-vacation-list',
  standalone: false,
  templateUrl: './vacation-list.component.html',
  styleUrls: ['./vacation-list.component.scss'],
})
export class VacationListComponent implements OnInit {
  displayedColumns: string[] = [
    'user',
    'startDate',
    'endDate',
    'days',
    'reason',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<Vacation>;
  usersMap: { [key: string]: User } = {};
  users: User[] = [];
  isLoading = false;
  isAdmin = false;
  isManager = false;
  availableDays = 0;
  usedDays = 0;
  view: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private vacationService: VacationService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();
    this.view = this.route.snapshot.data['view'];
    this.loadVacations();

    if (this.isAdmin && this.isManager) {
      this.loadUsers();
    }
  }

  loadVacations(): void {
    this.isLoading = true;
    this.vacationService.getVacations().subscribe({
      next: (vacations) => {
        this.dataSource.data = vacations;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vacations:', error);
        this.isLoading = false;
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as { [key: string]: User });
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  // loadVacationStats(): void {
  //   this.vacationService.getVacationStats().subscribe({
  //     next: (stats) => {
  //       this.availableDays = stats.availableDays;
  //       this.usedDays = stats.usedDays;
  //     },
  //     error: (error) => {
  //       console.error('Error loading vacation stats:', error);
  //     },
  //   });
  // }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = status.toLowerCase();
    }
  }

  filterByUser(userId: string): void {
    if (userId === 'all') {
      this.dataSource.data = this.dataSource.data;
    } else {
      this.dataSource.data = this.dataSource.data.filter(
        (vacation) => vacation.user === userId
      );
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
    }
  }

  createVacation(): void {
    this.router.navigate(['/vacations/form']);
  }

  viewVacation(vacation: Vacation): void {
    this.router.navigate(['/vacations', vacation.id]);
  }

  approveVacation(vacationId: string): void {
    this.vacationService.approveVacation(vacationId).subscribe({
      next: () => {
        this.loadVacations();
      },
      error: (error) => {
        console.error('Error approving vacation:', error);
      },
    });
  }

  rejectVacation(vacationId: string): void {
    this.vacationService.rejectVacation(vacationId).subscribe({
      next: () => {
        this.loadVacations();
      },
      error: (error) => {
        console.error('Error rejecting vacation:', error);
      },
    });
  }
}
