import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/authService';
import { Router, RouterModule } from '@angular/router';
import { TokenStorageService } from '../../services/tokenStorageService';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css'],
  imports: [CommonModule, RouterModule],
})
export class BoardAdminComponent implements OnInit {
  content?: string;

  constructor(private userService: UserService, private authService: AuthService, private tokenStorageService: TokenStorageService, private router: Router) { }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']);
}

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe(
      data => {
        this.content = data;
      },
      err => {
        this.content = JSON.parse(err.error).message;
      }
    );
  }
}
