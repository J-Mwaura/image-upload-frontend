import { Component, inject, OnInit } from '@angular/core';
import {  Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { AuthService } from './services/authService';
import { TokenStorageService } from './services/tokenStorageService';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet,  NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  //private readonly router = inject(Router);

  constructor( private router: Router, private authService: AuthService, private tokenStorage: TokenStorageService){}
  ngOnInit(): void {
    const isLoggedIn = !!this.tokenStorage.getToken();
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        this.authService.updateLoginStatus(true);
    }

    if (isLoggedIn) {
      if (this.tokenStorage.isTokenExpired()) {
          this.authService.updateLoginStatus(false);
          this.tokenStorage.signOut();
          this.router.navigate(['/login']);
      }
  }

  }
  title = 'skmsys';
}
