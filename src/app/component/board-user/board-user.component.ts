import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "./user-nav/user-nav.component";
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent
],
})
export class UserAreaComponent implements OnInit {

  content!: string;

  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getUserBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        this.content = JSON.parse(err.error).message;
      }
    });
  }

}
