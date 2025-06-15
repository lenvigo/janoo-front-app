import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { CheckinsModule } from './features/checkins/checkins.module';
import { IncidentsModule } from './features/incidents/incidents.module';
import { VacationsModule } from './features/vacations/vacations.module';

import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 6000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),

    CoreModule, // registra providers globales (interceptor, guards, servicios)
    SharedModule, // importa componentes Material globales (navbar, etc.)
    AuthModule, // Login / Register
    UsersModule, // Perfil / Lista de usuarios
    CheckinsModule, // Fichajes
    IncidentsModule, // Incidencias
    VacationsModule, // Vacaciones
    AppRoutingModule, // al final, para capturar RUTAS
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
