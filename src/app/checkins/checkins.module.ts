import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { CheckinFormComponent } from './checkin-form/checkin-form.component';
import { CheckinListComponent } from './checkin-list/checkin-list.component';

@NgModule({
  declarations: [CheckinFormComponent, CheckinListComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
  exports: [CheckinFormComponent, CheckinListComponent],
})
export class CheckinsModule {}
