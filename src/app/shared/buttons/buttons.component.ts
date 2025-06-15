import { AuthService } from './../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';
import { TokenStorageService } from '../../core/services/token-storage.service';
@Component({
  selector: 'app-buttons',
  standalone: false,
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss',
})
export class ButtonsComponent implements OnInit {
  isAdmin = false;
  isManager = false;
  isLoggedIn = false;
  private authSubscription: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private tokenStorage: TokenStorageService
  ) {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
      }
    );
  }
  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();
    this.isLoggedIn = !!this.tokenStorage.getToken();
  }
}
