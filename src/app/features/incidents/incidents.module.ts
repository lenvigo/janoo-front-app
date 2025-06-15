import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

import { SharedModule } from '../../shared/shared.module';
import { IncidentFormComponent } from './incident-form/incident-form.component';
import { IncidentListComponent } from './incident-list/incident-list.component';
import { ResolveIncidentDialogComponent } from './incident-list/resolve-incident-dialog/resolve-incident-dialog.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: 'form',
    component: IncidentFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: IncidentListComponent,
    canActivate: [AuthGuard],
    data: { view: 'own' },
  },
  {
    path: 'list',
    component: IncidentListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN_ROLE', 'MANAGER_ROLE'], view: 'all' },
  },
];

@NgModule({
  declarations: [
    IncidentFormComponent,
    IncidentListComponent,
    ResolveIncidentDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
  ],
  exports: [
    IncidentFormComponent,
    IncidentListComponent,
    ResolveIncidentDialogComponent,
  ],
})
export class IncidentsModule {}
