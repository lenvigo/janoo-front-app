import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

import { CheckinFormComponent } from './checkin-form/checkin-form.component';
import { CheckinListComponent } from './checkin-list/checkin-list.component';

const routes: Routes = [
  {
    path: 'form',
    component: CheckinFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'list',
    component: CheckinListComponent ,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN_ROLE', 'MANAGER_ROLE'] },
  },

];
@NgModule({
  declarations: [CheckinFormComponent, CheckinListComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule,  RouterModule.forChild(routes),],
  exports: [CheckinFormComponent, CheckinListComponent],
})
export class CheckinsModule {}
