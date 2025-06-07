import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import {
  VacationService,
  Vacation,
} from '../../core/services/vacation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vacation-list',
  templateUrl: './vacation-list.component.html',
  styleUrls: ['./vacation-list.component.scss'],
  standalone: false,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class VacationListComponent implements OnInit {
  displayedColumns: string[] = [
    'startDate',
    'endDate',
    'type',
    'reason',
    'status',
    'createdAt',
    'actions',
  ];
  dataSource: MatTableDataSource<Vacation>;
  isLoading = false;

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

  getTypeText(type: string): string {
    switch (type) {
      case 'ANNUAL':
        return 'Vacaciones Anuales';
      case 'SICK':
        return 'Enfermedad';
      case 'PERSONAL':
        return 'Asuntos Personales';
      default:
        return 'Otro';
    }
  }

  cancelVacation(id: number): void {
    this.vacationService.cancelVacation(id).subscribe({
      next: () => {
        this.toastr.success('Solicitud de vacaciones cancelada', 'Éxito');
        this.loadVacations();
      },
      error: (error) => {
        console.error('Error canceling vacation:', error);
      },
    });
  }

  createVacation(): void {
    this.router.navigate(['/vacations/new']);
  }
}
