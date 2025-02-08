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
    const user = this.tokenStorage.getUser();
    if (this.tokenStorage.getToken() && user?.roles) { // Add optional chaining
      this.isLoggedIn = true;
      this.roles = user.roles;
    }

    // if (this.tokenStorage.getToken()) {
    //   this.isLoggedIn = true;
    //   this.roles = this.tokenStorage.getUser().roles;
    // }
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  login(): void {
    if (this.loginForm.invalid) {
      return; // Don't submit if the form is invalid
    }

    this.isLoading = true;
    this.errorMessage = null;

    const loginRequest = this.loginForm.value;

    this.authService.login(loginRequest).subscribe({
      next: (data) => { // Correctly use 'data' here, not 'response'
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data); // Save the user object

        this.isLoginFailed = false;
        this.isLoggedIn = true;

        // Use setTimeout or Promise to ensure storage is complete
        setTimeout(() => { // Not ideal, but a workaround if necessary
          this.roles = this.tokenStorage.getUser().roles;
          this.router.navigate(['home']);
        }, 0);
        // this.tokenStorage.saveToken(data.token);
        // this.tokenStorage.saveUser(data);
        // this.isLoginFailed = false;
        // this.isLoggedIn = true;
        // this.roles = this.tokenStorage.getUser().roles;
        // this.router.navigate(['home']);
      },
      error: (error: HttpErrorResponse) => {
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
        this.isLoginFailed = true; // Set this flag to true on error
      },
      complete: () => this.isLoading = false // Ensure isLoading is set to false even on successful completion
    });
  }

  resetForm() {
    this.loginForm.reset(); // Resets the form values
    this.errorMessage = null; // Clears any error messages
    // Optional: If you want to reset the touched/dirty state as well:
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
  }
}