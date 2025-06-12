import { Component, OnInit, OnDestroy } from '@angular/core';
import { CheckinService } from '../../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Checkin } from '../../../core/models/checkin';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-checkin-form',
  standalone: false,
  templateUrl: './checkin-form.component.html',
  styleUrls: ['./checkin-form.component.scss'],
})
export class CheckinFormComponent implements OnInit, OnDestroy {
  lastCheckin: Checkin | null = null;
  todayCheckins: Checkin[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private checkinService: CheckinService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTodayCheckins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carga los fichajes de hoy para el usuario actual
  loadTodayCheckins(): void {
    this.isLoading = true;
    this.checkinService
      .listAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (checkins) => {
          const today = new Date();
          this.todayCheckins = checkins.filter((c) => {
            const ts = new Date(c.timestamp);
            return (
              ts.getFullYear() === today.getFullYear() &&
              ts.getMonth() === today.getMonth() &&
              ts.getDate() === today.getDate()
            );
          });
          this.todayCheckins.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.lastCheckin = this.todayCheckins.length
            ? this.todayCheckins[0]
            : null;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message, 'Error');
          if (error.message.includes('Sesión expirada')) {
            this.router.navigate(['/login']);
          }
        },
      });
  }

  // Marcar entrada o salida
  mark(type: 'IN' | 'OUT'): void {
    if (this.isLoading) return;

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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCheckin) => {
          this.toastr.success(
            `Fichaje ${type === 'IN' ? 'Entrada' : 'Salida'} registrado.`,
            'Éxito'
          );
          this.loadTodayCheckins();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message, 'Error');
          if (error.message.includes('Sesión expirada')) {
            this.router.navigate(['/login']);
          }
        },
      });
  }
}
