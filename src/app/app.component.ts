import { Component, OnInit } from '@angular/core';
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
          this.router.navigate(['/login']).then(r => { if (r) {
          //console.log('Navigation to /login was successful.');
          // You can perform additional actions here if navigation succeeds,
          // such as displaying a success message or updating component state.
        } else {
            console.error('Navigation to /login failed.');
            // You can handle navigation failure here, such as displaying an error message
            // to the user or logging the error.
          }
        });
      }
  }

  }
  title = 'skmsys';
}
