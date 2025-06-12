import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-buttons',
  standalone: false,
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss',
})
export class ButtonsComponent implements OnInit {
  isAdmin = false;
  isManager = false;

  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.isManager = this.userService.isManager();
  }
}
