import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  logout(): void {
    this.tokenStorage.signOut();
    this.router.navigateByUrl('/auth/login');
  }
}
