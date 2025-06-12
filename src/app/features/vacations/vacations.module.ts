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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

import { SharedModule } from '../../shared/shared.module';
import { VacationFormComponent } from './vacation-form/vacation-form.component';
import { VacationListComponent } from './vacation-list/vacation-list.component';

const routes: Routes = [
  {
    path: 'form',
    component: VacationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: VacationListComponent,
    canActivate: [AuthGuard],
    data: { view: 'own' },
  },
  {
    path: 'list',
    component: VacationListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN_ROLE', 'MANAGER_ROLE'], view: 'all' },
  },
];

@NgModule({
  declarations: [VacationFormComponent, VacationListComponent],
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
  ],
  exports: [VacationFormComponent, VacationListComponent],
})
export class VacationsModule {}
