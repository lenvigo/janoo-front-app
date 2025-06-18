import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Checkin } from '../../../core/models/checkin';
import { CheckinService } from '../../../core/services/checkin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-checkin-list',
  standalone: false,
  templateUrl: './checkin-list.component.html',
  styleUrls: ['./checkin-list.component.scss'],
})
export class CheckinListComponent implements OnInit {
  displayedColumns: string[] = ['user', 'type', 'timestamp'];
  checkins: Checkin[] = [];
  dataSource: MatTableDataSource<Checkin>;
  users: User[] = [];
  usersMap: { [id: string]: User } = {};

  isLoading = false;
  isAdmin = false;
  isManager = false;
  dateRange: FormGroup;

  getUserName(id: string): string {
    return this.usersMap[id]?.name ?? 'Usuario no encontrado';
  }
  constructor(
    private checkinService: CheckinService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource();
    this.dateRange = this.fb.group({
      start: [''],
      end: [''],
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();

    this.loadCheckins();
    if (this.isAdmin || this.isManager) {
      this.userService.getAllUsers().subscribe((users) => {
        this.usersMap = {};
        users.forEach((user) => {
          this.usersMap[user.id] = user;
        });
      });
    }
    this.dateRange.valueChanges.subscribe((val) => {
      this.filterByDateRange(val);
    });
  }

  filterByDateRange(val: { start: Date; end: Date }) {
    if (!val.start && !val.end) {
      this.dataSource.data = this.checkins;
      return;
    }
    this.dataSource.data = this.checkins.filter((chk) => {
      const date = new Date(chk.timestamp);
      const start = val.start ? new Date(val.start) : null;
      const end = val.end ? new Date(val.end) : null;
      if (end) end.setHours(23, 59, 59, 999);
      return (!start || date >= start) && (!end || date <= end);
    });
  }
  get usersArray(): User[] {
    return Object.values(this.usersMap);
  }

  loadCheckins(): void {
    this.isLoading = true;
    this.checkinService.listAll().subscribe({
      next: (checkins) => {
        this.checkins = checkins;
        this.dataSource.data = checkins;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading checkins:', error);
        this.isLoading = false;
      },
    });
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
        console.error('Error al cargar fichajes', 'Error');
      },
    });
  }

  loadUserCheckins(userId: string): void {
    this.isLoading = true;
    this.checkinService.getUserCheckins(userId).subscribe({
      next: (checkins) => {
        this.isLoading = false;
        this.dataSource.data = checkins;
      },
      error: () => {
        this.isLoading = false;
        console.error('Error loading user checkins:', 'Error');
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as { [key: string]: User });
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  filterByUser(userId: string): void {
    if (userId === 'all') {
      this.dataSource.data = this.checkins;
    } else {
      this.dataSource.data = this.checkins.filter(
        (checkin) => checkin.user === userId
      );
    }
  }

  getTypeIcon(type: string): string {
    return type.toLowerCase() === 'entry' ? 'login' : 'logout';
  }

  createCheckin(): void {
    this.router.navigate(['/checkins/new']);
  }

  //No implemntar
  // deleteCheckin(checkinId: string): void {
  //   if (confirm('¿Está seguro de que desea eliminar este fichaje?')) {
  //     this.checkinService.deleteCheckin(checkinId).subscribe({
  //       next: () => {
  //         this.loadCheckins();
  //       },
  //       error: (error) => {
  //         console.error('Error deleting checkin:', error);
  //       },
  //     });
  //   }
  // }

  exportToExcel(): void {
    const data = this.dataSource.data.map((checkin) => {
      const user = this.users.find((u) => u.id === checkin.user);
      return {
        Usuario: this.getUserName(checkin.user),
        Tipo: checkin.type,
        Fecha: new Date(checkin.timestamp).toLocaleString(),
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { Fichajes: worksheet },
      SheetNames: ['Fichajes'],
    };
    XLSX.writeFile(workbook, 'fichajes.xlsx');
  }
}
