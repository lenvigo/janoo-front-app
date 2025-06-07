import { Component, OnInit } from '@angular/core';
import { CheckinService } from '../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Checkin } from '../../core/models/checkin';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-checkin-form',
  standalone: false,
  templateUrl: './checkin-form.component.html',
  styleUrls: ['./checkin-form.component.scss'],
})
export class CheckinFormComponent implements OnInit {
  lastCheckin: Checkin | null = null;
  todayCheckins: Checkin[] = [];
  isLoading = false;

  constructor(
    private checkinService: CheckinService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTodayCheckins();
  }

  // Carga los fichajes de hoy para el usuario actual
  loadTodayCheckins(): void {
    this.isLoading = true;
    this.checkinService
      .listAll()
      .pipe(
        catchError((error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.toastr.error('Sesión expirada', 'Error de autenticación');
            this.router.navigate(['/login']);
          } else {
            this.toastr.error('Error al cargar fichajes', 'Error');
          }
          return of([]);
        })
      )
      .subscribe((checkins) => {
        // Filtramos solo los de hoy del usuario
        const today = new Date();
        this.todayCheckins = checkins.filter((c) => {
          const ts = new Date(c.timestamp);
          return (
            ts.getFullYear() === today.getFullYear() &&
            ts.getMonth() === today.getMonth() &&
            ts.getDate() === today.getDate()
          );
        });
        // Orden descendente de timestamp
        this.todayCheckins.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.lastCheckin = this.todayCheckins.length
          ? this.todayCheckins[0]
          : null;
        this.isLoading = false;
      });
  }

  // Marcar entrada o salida
  mark(type: 'IN' | 'OUT'): void {
    // Regla: no permitir "OUT" si el último no fue "IN" pendiente de salida
    if (
      type === 'OUT' &&
      (!this.lastCheckin || this.lastCheckin.type !== 'IN')
    ) {
      this.toastr.error(
        'Primero debes marcar una entrada antes de la salida.',
        'Operación no permitida'
      );
      return;
    }
    this.isLoading = true;
    this.checkinService
      .create(type)
      .pipe(
        catchError((error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.toastr.error('Sesión expirada', 'Error de autenticación');
            this.router.navigate(['/login']);
          } else if (error.error?.error) {
            this.toastr.error(error.error.error, 'Error al fichar');
          } else {
            this.toastr.error('Error del servidor', 'Error al fichar');
          }
          return of(null);
        })
      )
      .subscribe((newCheckin) => {
        if (newCheckin) {
          this.toastr.success(
            `Fichaje ${type === 'IN' ? 'Entrada' : 'Salida'} registrado.`,
            'Éxito'
          );
          this.loadTodayCheckins();
        }
      });
  }
}
