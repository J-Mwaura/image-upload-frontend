import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; // Import Router

import { TokenStorageService } from '../../services/tokenStorageService';

const USER_ROLE = 'USER';
const ADMIN_ROLE = 'ADMIN';

@Component({
  standalone: true,
  selector: 'app-choice-urls',
  templateUrl: './choice-urls.component.html',
  styleUrls: ['./choice-urls.component.css'],
  imports: [CommonModule, MatListModule, RouterLink, RouterLinkActive]
})

export class ChoiceUrlsComponent implements OnInit {
  isLoggedIn = false;
  showAdminBoard = false;
  showUserBoard = false;
  username: string | null = null;

  constructor(private tokenStorageService: TokenStorageService, private router: Router) { } // Inject Router

  ngOnInit(): void {
    console.log("Before getToken():", this.isLoggedIn); // Check when getToken is called
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    console.log("After getToken(): isLoggedIn =", this.isLoggedIn); // Check the value


    // if (this.isLoggedIn) {
    //   const user = this.tokenStorageService.getUser();

    //   this.showAdminBoard = user?.roles?.includes(ADMIN_ROLE) ?? false;
    //   this.showUserBoard = user?.roles?.includes(USER_ROLE) ?? false;
    //   // this.showUserBoard = this.showAdminBoard || (user?.roles?.includes(USER_ROLE) ?? false); // Simplified and more efficient

    //   this.username = user?.username ?? null;
    // }
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      // Use optional chaining and nullish coalescing to handle potential null values
      this.showAdminBoard = user?.roles?.includes(ADMIN_ROLE) ?? false;
      this.showUserBoard = user?.roles?.includes(ADMIN_ROLE) ?? false; // Admin has access
      if (!this.showUserBoard) { // If not an admin, check for user role
        this.showUserBoard = user?.roles?.includes(USER_ROLE) ?? false; // User has access
      }
      this.username = user?.username ?? null; // Set username, handle potential null
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']); // Use router.navigate instead of reload
  }
}