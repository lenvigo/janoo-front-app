import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

import { CheckinFormComponent } from './checkin-form/checkin-form.component';
import { CheckinListComponent } from './checkin-list/checkin-list.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DATE_LOCALE } from '@angular/material/core';

const routes: Routes = [
  {
    path: 'form',
    component: CheckinFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: CheckinListComponent,
    canActivate: [AuthGuard],
  },
];
@NgModule({
  declarations: [CheckinFormComponent, CheckinListComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
  exports: [CheckinFormComponent, CheckinListComponent],
})
export class CheckinsModule {}
