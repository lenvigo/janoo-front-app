import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './user-list/user-list.component';

@NgModule({
  declarations: [ProfileComponent, UserListComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  exports: [ProfileComponent, UserListComponent],
})
export class UsersModule {}
