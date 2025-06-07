import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './user-list/user-list.component';

@NgModule({
  declarations: [ProfileComponent, UserListComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
  exports: [ProfileComponent, UserListComponent],
})
export class UsersModule {}
