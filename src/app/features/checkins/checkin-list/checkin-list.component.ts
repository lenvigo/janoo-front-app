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
  viewMode: 'own' | 'all' = 'own';

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
    this.checkViewMode();
    this.loadCheckins();
    if (this.isAdmin || this.isManager) {
      this.userService.getAllUsers().subscribe((users) => {
        this.usersMap = {};
        users.forEach((user) => {
          this.usersMap[user.id] = user;
        });
      });
    }
  }

  get usersArray(): User[] {
    return Object.values(this.usersMap);
  }
  private checkViewMode(): void {
    this.route.data.subscribe((data) => {
      this.viewMode = data['view'] || 'own';
    });
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
    this.userService.listAll().subscribe({
      next: (users) => {
        this.users = users;
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
        Usuario: user ? user.name : checkin.user, // Si no encuentra el usuario, muestra el id
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
