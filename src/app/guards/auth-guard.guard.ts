import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/authService.service';
import { of } from 'rxjs';
import { map, catchError, } from 'rxjs/operators'; // Import filter and tap
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenStorageService } from '../services/tokenStorageService';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const tokenService = inject(TokenStorageService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    return authService.isLoggedIn$.pipe(
        map(isLoggedIn => {
            if (isLoggedIn) {
                return true;  // User is logged in, allow access
            } else {
                snackBar.open('You must log in to access this page.', 'Close', { duration: 5000 });
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false; // User is not logged in, redirect to login
            }
        }),
        catchError((error) => {
            console.error("An error occurred:", error);
            return of(false);
        })
    );
};