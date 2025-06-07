import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import {
  VacationService,
  Vacation,
} from '../../core/services/vacation.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vacation-list',
  standalone: false,
  templateUrl: './vacation-list.component.html',
  styleUrls: ['./vacation-list.component.scss'],
})
export class VacationListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'startDate',
    'endDate',
    'reason',
    'status',
    'createdAt',
    'actions',
  ];
  dataSource: MatTableDataSource<Vacation>;
  isLoading = false;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private vacationService: VacationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadVacations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVacations(): void {
    this.isLoading = true;
    this.vacationService
      .getVacations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vacations) => {
          this.dataSource.data = vacations;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message, 'Error');
          if (error.message.includes('Sesión expirada')) {
            this.router.navigate(['/auth/login']);
          }
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Aprobado';
      case 'REJECTED':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  cancelVacation(id: string): void {
    this.vacationService
      .rejectVacation(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Solicitud de vacaciones cancelada', 'Éxito');
          this.loadVacations();
        },
        error: (error) => {
          this.toastr.error(error.message, 'Error');
          if (error.message.includes('Sesión expirada')) {
            this.router.navigate(['/auth/login']);
          }
        },
      });
  }

  createVacation(): void {
    this.router.navigate(['/vacations/new']);
  }
}
