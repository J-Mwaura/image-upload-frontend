import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/authService';
import { of } from 'rxjs';
import { map, catchError, switchMap, filter, } from 'rxjs/operators'; // Import filter and tap
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenStorageService } from '../services/tokenStorageService';
import { User } from '../model/user';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const tokenService = inject(TokenStorageService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    // return authService.isLoggedIn$.pipe(
    //     map(isLoggedIn => {
    //         if (isLoggedIn) {
    //             return true;  // User is logged in, allow access
    //         } else {
    //             snackBar.open('You must log in to access this page.', 'Close', { duration: 5000 });
    //             router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    //             return false; // User is not logged in, redirect to login
    //         }
    //     }),
    //     catchError((error) => {
    //         console.error("An error occurred:", error);
    //         return of(false);
    //     })
    // );

    return authService.isLoggedIn$.pipe(
        switchMap(isLoggedIn => {
            if (isLoggedIn) {
                return tokenService.getUser().pipe( // Get the user (Observable<User | null>)
                    filter(user => user !== null), // Filter out null user values
                    map((user: User) => { // user is now guaranteed to be non-null and of type User
                        return true; // Allow access
                    }),
                    catchError((error) => {
                        console.error("Error retrieving user:", error);
                        tokenService.signOut(); // Clear invalid token
                        router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Redirect to login
                        return of(false);
                    })
                );
            } else {
                snackBar.open('You must log in to access this page.', 'Close', { duration: 5000 });
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return of(false);
            }
        }),
        catchError((error) => { // Outer catchError (less common)
            console.error("An error occurred:", error);
            return of(false);
        })
    );
};