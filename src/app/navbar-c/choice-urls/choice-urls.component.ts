import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TokenStorageService } from '../../services/tokenStorageService';
import { BehaviorSubject, Observable, takeUntil, of, Subject } from 'rxjs'; // No need to import Subject
import { User } from '../../model/user'; // Import your User type
import { catchError, filter, map } from 'rxjs/operators'; // Import map

const USER_ROLE = 'USER';
const ADMIN_ROLE = 'ADMIN';

@Component({
  standalone: true,
  selector: 'app-choice-urls',
  templateUrl: './choice-urls.component.html',
  styleUrls: ['./choice-urls.component.css'],
  imports: [CommonModule, MatListModule, RouterLink, RouterLinkActive]
})

export class ChoiceUrlsComponent implements OnInit, OnDestroy {
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  showAdminBoard$: Observable<boolean> | undefined;
  showUserBoard$: Observable<boolean> | undefined;
  username$: Observable<string | null> | undefined;
  private destroy$ = new Subject<void>();
  user: User | null = null; // Store the user object

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  ngOnInit(): void {
      const initialLoginStatus = !!this.tokenStorageService.getToken();
      this.isLoggedIn$.next(initialLoginStatus);

      this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(isLoggedIn => {
          if (isLoggedIn) {
              this.initializeUserObservables();
          } else {
              this.resetUserStatus(); // Call reset function
          }
      });
  }

  private initializeUserObservables() {

      this.tokenStorageService.getUser().pipe(
          filter(user => user !== null),
          map((user: User) => {
              this.user = user; // Store the user object
              console.log("user role: " + this.user?.roles);
              return user; // Return the user object
          }),
          catchError((error) => {
              console.error("Error retrieving user:", error);
              this.resetUserStatus(); // Reset on error
              return of(null); // Return null to complete the observable
          })
      ).subscribe((user: User | null) => {
          if (user) {
               console.log(this.showAdminBoard$ = of(user.roles?.includes(ADMIN_ROLE) ?? false));
              this.showUserBoard$ = of((user.roles?.includes(ADMIN_ROLE) || user.roles?.includes(USER_ROLE)) ?? false);
              this.username$ = of(user.username ?? null);
          } else {
              this.resetUserStatus();
          }
      });
  }

  private resetUserStatus() {
      this.showAdminBoard$ = of(false);
      this.showUserBoard$ = of(false);
      this.username$ = of(null);
      this.user = null; // Clear the user object
  }

  logout(): void {
      this.tokenStorageService.signOut();
      this.isLoggedIn$.next(false);
      this.router.navigate(['/login']);
      this.resetUserStatus(); // Reset status on logout
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  // Example of how to use the user object in the template:
  hasAdminAccess(): boolean {
      return !!this.user?.roles?.includes(ADMIN_ROLE);
  }

   hasUserAccess(): boolean {
      return !!this.user?.roles?.includes(USER_ROLE) || !!this.user?.roles?.includes(ADMIN_ROLE);
  }
}