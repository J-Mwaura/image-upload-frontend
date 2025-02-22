import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError, switchMap} from 'rxjs'; // Import necessary RxJS operators
import { TokenStorageService } from '../services/tokenStorageService';
import { AuthService } from '../services/authService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/home/home', '/api/images/{id}'];

    if (publicUrls.some((url) => req.url.includes(url))) {
        return next(req); // Skip interception for public URLs
    }

    const tokenService = inject(TokenStorageService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    let authReq = req; // Create a mutable copy of the request

    const token = tokenService.getToken();
    if (token) {
        authReq = req.clone({
            withCredentials: true,
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe( // Use the mutable request
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) { // 401 Unauthorized - Token expired or invalid
                const refreshToken = tokenService.getRefreshToken();

                if (refreshToken) {
                    return authService.refreshToken(refreshToken).pipe( // Call refresh token API
                        switchMap((newToken: any) => { // Use switchMap to chain observables
                            tokenService.saveToken(newToken.accessToken); // Save the new token
                            authReq = authReq.clone({ // Clone the original request with the new token
                                withCredentials: true,
                                setHeaders: {
                                    Authorization: `Bearer ${newToken.accessToken}`
                                }
                            });
                            return next(authReq); // Retry the request
                        }),
                        catchError((refreshError) => { // Handle refresh token errors
                            authService.updateLoginStatus(false);
                            tokenService.signOut();
                            router.navigate(['/login']);
                            snackBar.open('Your session has expired. Please log in again.', 'Close', { duration: 5000 });
                            return throwError(() => refreshError); // Throw refresh error
                        })
                    );
                } else {
                    authService.updateLoginStatus(false);
                    tokenService.signOut();
                    router.navigate(['/login']);
                    snackBar.open('Your session has expired. Please log in again.', 'Close', { duration: 5000 });
                    return throwError(() => error); // Throw original error
                }
            }
            return throwError(() => error); // Re-throw other errors
        })
    );
};