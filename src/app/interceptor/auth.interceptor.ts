import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core'; // Import inject
import { Router } from '@angular/router'; // Import Router
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/tokenStorageService';
import { AuthService } from '../services/authService.service';

const TOKEN_KEY = 'auth-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/home/home'];

    if (publicUrls.some((url) => req.url.includes(url))) {
        return next(req); // Skip interception for public URLs
    }

    const tokenService = inject(TokenStorageService); // Inject TokenStorageService
    const authService = inject(AuthService); // Inject AuthService
    const router = inject(Router); // Inject Router
    const snackBar = inject(MatSnackBar); // Inject MatSnackBar
    const token = tokenService.getToken();

    if (token) {
        req = req.clone({
            withCredentials: true, // Important for sending cookies with requests
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) { // 401 Unauthorized - Token expired
              authService.updateLoginStatus(false);
                tokenService.signOut(); // Clear token
                router.navigate(['/login']); // Redirect to login
                snackBar.open('Your session has expired. Please log in again.', 'Close', { duration: 5000 }); // Notify user
            }
            return throwError(() => error); // Re-throw the error
        })
    );
};