import { Component, inject, OnInit } from '@angular/core';
import {
    FormBuilder, FormGroup, FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TokenStorageService } from '../../services/tokenStorageService';
import { AuthService } from '../../services/authService';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../model/user';
import { take } from 'rxjs/operators';
import { JwtResponse } from '../../model/response/JwtResponse ';
import { mapJwtResponseToUser } from '../../model/utils/mapJwtResponseToUser';
import { SnackbarService } from '../../services/snackbar.service';
import { LowercaseTrimDirective } from '../directives/lowercase.directive';
import { TrimTrailingSpacesDirective } from '../directives/trim-trailing-spaces.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, 
        CommonModule, TrimTrailingSpacesDirective, LowercaseTrimDirective, MatProgressSpinnerModule ]
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
    private snackbar = inject(SnackbarService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private tokenStorage = inject(TokenStorageService);

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        this.checkLoginStatus();
    }

    private checkLoginStatus() {
        const token = this.tokenStorage.getToken();
        if (token) {
            this.tokenStorage.getUser().pipe(take(1)).subscribe((user: User | null) => {
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

        this.authService.login(loginRequest).subscribe({
            next: (data: JwtResponse) => {
                this.tokenStorage.saveToken(data.token!).then(() => {
                    const user: User = mapJwtResponseToUser(data);
                    return this.tokenStorage.saveUser(user);
                }).then(() => {
                    this.isLoginFailed = false;
                    this.isLoggedIn = true;

                    this.tokenStorage.getUser().pipe(take(1)).subscribe((user: User | null) => {
                        if (user && user.roles) {
                            this.roles = user.roles;
                            if (this.roles.includes('ADMIN')) {
                                this.router.navigate(['admin']);
                            } else {
                                this.router.navigate(['user']);
                            }
                            this.snackbar.success('Login successful!');
                        } else {
                            //console.error("User data not found after login.");
                            this.errorMessage = "An error occurred during login. Please try again.";
                            this.isLoginFailed = true;
                            this.snackbar.error(this.errorMessage);
                        }
                    });
                }).catch(error => {
                    //console.error("Error saving token/user:", error);
                    this.isLoading = false;
                    this.errorMessage = "An error occurred during login. Please try again.";
                    this.isLoginFailed = true;
                    this.snackbar.error(this.errorMessage);
                });
            },
            error: (error: HttpErrorResponse) => {
                //console.error('Login error:', error);
                this.isLoading = false;
                this.isLoginFailed = true;

                let errorMessage = 'Login failed. Please try again.';

                if (error.status === 401) {
                    errorMessage = 'Invalid username or password. Please check your credentials.';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                } else if (error.status === 0) {
                    errorMessage = 'Network error. Please check your internet connection.';
                }

                this.errorMessage = errorMessage;
                this.snackbar.error(errorMessage);
            },
            complete: () => this.isLoading = false
        });
    }

    resetForm() {
        // ...
    }
}