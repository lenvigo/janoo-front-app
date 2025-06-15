import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { AuthGuard } from './core/guards/auth.guard';

import { AutoRedirectGuard } from './core/guards/auto-redirect.guard';
import { ProfileComponent } from './features/users/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AutoRedirectGuard],
    component: ProfileComponent,
  },

  // --- Autenticación ---
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // --- Perfil / Usuarios ---
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.module').then((m) => m.UsersModule),

    canActivate: [AuthGuard],
  },

  // --- Fichajes ---
  {
    path: 'checkins',
    loadChildren: () =>
      import('./features/checkins/checkins.module').then(
        (m) => m.CheckinsModule
      ),
    canActivate: [AuthGuard],
  },

  // --- Incidencias ---
  {
    path: 'incidents',
    loadChildren: () =>
      import('./features/incidents/incidents.module').then(
        (m) => m.IncidentsModule
      ),
    canActivate: [AuthGuard],
  },

  // --- Vacaciones ---
  {
    path: 'vacations',
    loadChildren: () =>
      import('./features/vacations/vacations.module').then(
        (m) => m.VacationsModule
      ),
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
