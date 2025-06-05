import { Component, OnInit } from '@angular/core';
import { CheckinService } from '../../core/services/checkin.service';
import { ToastrService } from 'ngx-toastr';
import { Checkin } from '../../core/models/checkin';

@Component({
  selector: 'app-checkin-list',
  standalone: false,
  templateUrl: './checkin-list.component.html',
  styleUrls: ['./checkin-list.component.scss'],
})
export class CheckinListComponent implements OnInit {
  checkins: Checkin[] = [];
  isLoading = false;

  displayedColumns: string[] = ['user', 'type', 'timestamp'];

  constructor(
    private checkinService: CheckinService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllCheckins();
  }

  loadAllCheckins(): void {
    this.isLoading = true;
    this.checkinService.listAll().subscribe({
      next: (checkins) => {
        this.isLoading = false;
        // Ordenamos por timestamp descendente
        this.checkins = checkins.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error al cargar fichajes', 'Error');
      },
    });
  }
}
