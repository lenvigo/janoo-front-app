import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
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
  IncidentService,
  Incident,
} from '../../core/services/incident.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-incident-list',
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.scss'],
  standalone: true,
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
export class IncidentListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'type',
    'priority',
    'status',
    'createdAt',
    'updatedAt',
    'actions',
  ];
  dataSource: MatTableDataSource<Incident>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.isLoading = true;
    this.incidentService.getIncidents().subscribe({
      next: (incidents) => {
        this.dataSource.data = incidents;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading incidents:', error);
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
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'RESOLVED':
        return 'Resuelto';
      case 'CLOSED':
        return 'Cerrado';
      default:
        return 'Pendiente';
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      default:
        return 'Baja';
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'HARDWARE':
        return 'Hardware';
      case 'SOFTWARE':
        return 'Software';
      case 'NETWORK':
        return 'Red';
      default:
        return 'Otro';
    }
  }

  viewIncident(id: number): void {
    this.router.navigate(['/incidents', id]);
  }

  closeIncident(id: number): void {
    this.incidentService.closeIncident(id).subscribe({
      next: () => {
        this.loadIncidents();
        this.toastr.success('Incidencia cerrada correctamente', 'Éxito');
      },
      error: (error) => {
        console.error('Error closing incident:', error);
      },
    });
  }

  createIncident(): void {
    this.router.navigate(['/incidents/new']);
  }
}
