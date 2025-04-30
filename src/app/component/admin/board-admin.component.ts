import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { TokenStorageService } from '../../services/tokenStorageService';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from "./admin-nav/admin-nav.component";

@Component({
  standalone: true,
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css'],
  imports: [CommonModule, RouterModule, AdminNavComponent],
})
export class AdminAreaComponent implements OnInit {
  content?: string;

  constructor(private userService: UserService, private tokenStorageService: TokenStorageService, private router: Router) { }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']).then(r => {

    } );
}

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        this.content = JSON.parse(err.error).message;
      }
    });
  }
}
