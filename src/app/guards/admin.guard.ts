import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/authService';
import { of } from 'rxjs';
import { switchMap, map, catchError, filter } from 'rxjs/operators'; // Import filter
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenStorageService } from '../services/tokenStorageService';
import { User } from '../model/user'; // Import your User type

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const tokenService = inject(TokenStorageService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    return tokenService.getUser().pipe( // Get user as Observable
        switchMap((user: User | null) => { // switchMap to handle async operations
          if (authService.isAdmin(user)) {
            return of(true); // Allow access
          } else {
            snackBar.open('You do not have permission to access this page.', 'Close', { duration: 3000 });
            router.navigate(['/home']);
            return of(false); // Prevent access
          }
        }),
        catchError(() => { // Handle potential errors during getUser()
          snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 5000 });
          router.navigate(['/home']);
          return of(false);
        })
      );
    

    // return authService.isLoggedIn$.pipe(
    //     switchMap(isLoggedIn => {
    //         if (isLoggedIn) {
    //             return tokenService.getUser().pipe( // Get the user (Observable<User | null>)
    //                 filter(user => user !== null), // Filter out null user values
    //                 map((user: User) => { // user is now guaranteed to be non-null and of type User
                        
    //                     if (user.roles.includes('ADMIN')) {
    //                         return true;
    //                     } else {
    //                         snackBar.open('You do not have permission to access this page.', 'Close', { duration: 3000 });
    //                         router.navigate(['/home']);
    //                         return false;
    //                     }
    //                 }),
    //                 catchError((error) => {
    //                     console.error("Error retrieving user:", error);
    //                     snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 5000 });
    //                     router.navigate(['/home']);
    //                     return of(false);
    //                 })
    //             );
    //         } else {
    //             snackBar.open('You must log in to access this page.', 'Close', { duration: 5000 });
    //             router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    //             return of(false);
    //         }
    //     }),
    //     catchError((error) => {
    //         console.error("An error occurred:", error);
    //         return of(false);
    //     })
    // );
};