import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { IncidentService } from '../../../core/services/incident.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { ResolveIncidentDialogComponent } from './resolve-incident-dialog/resolve-incident-dialog.component';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';
import { Incident } from '../../../core/models/incident';

@Component({
  selector: 'app-incident-list',
  standalone: false,
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.scss'],
})
export class IncidentListComponent implements OnInit {
  usersMap: { [id: string]: User } = {};
  displayedColumns: string[] = [
    'user',
    'title',
    'description',
    'status',
    'createdAt',
    'resolvedAt',
    'actions',
  ];
  dataSource: MatTableDataSource<Incident>;
  isLoading = false;
  isManager = false;
  isAdmin = false;
  viewMode: 'own' | 'all' = 'own';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.checkUserRoles();
    this.checkViewMode();
    this.loadIncidents();
    if (this.isAdmin || this.isManager) {
      this.userService.getAllUsers().subscribe((users) => {
        this.usersMap = {};
        users.forEach((user) => {
          this.usersMap[user.id] = user;
        });
      });
    }
  }

  private checkUserRoles(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isManager = user.roles.includes('MANAGER_ROLE');
      this.isAdmin = user.roles.includes('ADMIN_ROLE');
    }
  }

  private checkViewMode(): void {
    this.route.data.subscribe((data) => {
      this.viewMode = data['view'] || 'own';
    });
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

  // getStatusText(status: string): string {
  //   switch (status) {
  //     case 'RESOLVED':
  //       return 'Resuelto';
  //     default:
  //       return 'Pendiente';
  //   }
  // }
  getStatusText(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'En Progreso';
      case 'RESOLVED':
        return 'Resuelto';
      case 'CLOSED':
        return 'Cerrado';
      default:
        return 'eN pROGRESO';
    }
  }

  openResolveDialog(incident: Incident): void {
    const dialogRef = this.dialog.open(ResolveIncidentDialogComponent, {
      data: { incident },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resolveIncident(incident.id, result);
      }
    });
  }

  resolveIncident(id: string, managerComment: string): void {
    this.incidentService.resolveIncident(id, managerComment).subscribe({
      next: () => {
        this.loadIncidents();
        this.toastr.success('Incidencia resuelta correctamente', 'Éxito');
      },
      error: (error) => {
        console.error('Error resolving incident:', error);
      },
    });
  }

  createIncident(): void {
    this.router.navigate(['/incidents/new']);
  }

  canManageIncidents(): boolean {
    return this.isManager || this.isAdmin;
  }

  canDeleteIncidents(): boolean {
    return this.isAdmin;
  }

  viewIncident(incident: Incident): void {
    this.router.navigate(['/incidents', incident.id]);
  }
}
