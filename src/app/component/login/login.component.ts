import { Component, inject, OnInit } from '@angular/core';
import {
    FormBuilder, FormGroup, FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TokenStorageService } from '../../services/tokenStorageService';
import { AuthService } from '../../services/authService.service';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../model/user'; // Import your User type
import { take } from 'rxjs/operators'; // Import take
import { JwtResponse } from '../../model/JwtResponse ';
import { mapJwtResponseToUser } from '../../model/utils/mapJwtResponseToUser';


@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, CommonModule]
})
export class LoginComponent implements OnInit {
    color = "primary";
    loginForm!: FormGroup;
    errorMessage: string | null = null;
    isLoading: boolean = false;
    isLoggedIn = false;
    isLoginFailed = false;
    roles: string[] = [];

    private readonly router = inject(Router);

    constructor(private authService: AuthService, private http: HttpClient, private fb: FormBuilder,
        private tokenStorage: TokenStorageService) { }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        this.checkLoginStatus(); // Call the function to check login status
    }

    private checkLoginStatus() {  // Function to handle login status check
        const token = this.tokenStorage.getToken();
        if (token) {
            this.tokenStorage.getUser().pipe(take(1)).subscribe((user: User | null) => { // Use pipe and subscribe
                if (user && user.roles) {
                    this.isLoggedIn = true;
                    this.roles = user.roles;
                }
            });
        }
    }


    get usernameControl() {
        return this.loginForm.get('username');
    }

    get passwordControl() {
        return this.loginForm.get('password');
    }

    login(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const loginRequest = this.loginForm.value;

        this.authService.login(loginRequest).subscribe({ // Only one call to login
          next: (data: JwtResponse) => { // Type data as JwtResponse
              this.tokenStorage.saveToken(data.token!).then(() => {
                  const user: User = mapJwtResponseToUser(data); // Convert JwtResponse to User
                  return this.tokenStorage.saveUser(user); // Now saveUser will accept the User object
              }).then(() => {
                  this.isLoginFailed = false;
                  this.isLoggedIn = true;

                  this.tokenStorage.getUser().pipe(take(1)).subscribe((user: User | null) => {
                      if (user && user.roles) {
                          this.roles = user.roles;
                          this.router.navigate(['home']);
                      } else {
                          console.error("User data not found after login.");
                          this.errorMessage = "An error occurred during login. Please try again.";
                          this.isLoginFailed = true;
                      }
                  });
              }).catch(error => { // Catch any errors in the Promise chain (saveToken or saveUser)
                  console.error("Error saving token/user:", error);
                  this.isLoading = false;
                  this.errorMessage = "An error occurred during login. Please try again.";
                  this.isLoginFailed = true;
              });
          },
          error: (error: HttpErrorResponse) => { // Error handling for authService.login
              console.error('Login error:', error);
              this.isLoading = false;

              let errorMessage = 'Login failed. Please try again.';

              if (error.error) {
                  const backendError = error.error;

                  if (backendError.errors && Array.isArray(backendError.errors)) {
                      errorMessage = backendError.errors.join('\n');
                  } else if (backendError.message) {
                      errorMessage = backendError.message;
                  } else if (typeof backendError === 'string') {
                      errorMessage = backendError;
                  } else if (error.status === 401) {
                      errorMessage = "Invalid username or password.";
                  } else if (error.status === 0) {
                      errorMessage = 'A client-side or network error occurred. Please check your connection.';
                  } else {
                      errorMessage = "An unexpected error occurred. Please try again later.";
                  }
              }
              this.errorMessage = errorMessage;
              this.isLoginFailed = true;
          },
          complete: () => this.isLoading = false
      });
    }

    resetForm() {
        // ...
    }
}