import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './users/profile/profile.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { CheckinFormComponent } from './checkins/checkin-form/checkin-form.component';
import { CheckinListComponent } from './checkins/checkin-list/checkin-list.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'users/profile', pathMatch: 'full' },

  // --- Autenticación ---
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // --- Perfil / Usuarios ---
  {
    path: 'users/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['MANAGER_ROLE', 'ADMIN_ROLE'] },
  },

  // --- Fichajes ---
  {
    path: 'checkins',
    component: CheckinFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'checkins/list',
    component: CheckinListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['MANAGER_ROLE', 'ADMIN_ROLE'] },
  },
  {
    path: 'checkins/history',
    component: CheckinListComponent,
    canActivate: [AuthGuard],
  },

  // --- Incidencias ---
  {
    path: 'incidents',
    loadChildren: () =>
      import('./incidents/incidents.module').then((m) => m.IncidentsModule),
    canActivate: [AuthGuard],
  },

  // --- Vacaciones ---
  {
    path: 'vacations',
    loadChildren: () =>
      import('./vacations/vacations.module').then((m) => m.VacationsModule),
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'users/profile' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
