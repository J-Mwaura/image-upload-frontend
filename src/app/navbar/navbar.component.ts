import { Component, inject, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenStorageService } from '../services/tokenStorageService';
import { AuthService } from '../services/authService';
import { User } from '../model/user';

const USER_ROLE = 'USER';
const ADMIN_ROLE = 'ADMIN';

@Component({
  selector: 'app-navbar',
  templateUrl: `./navbar.component.html`,
  styleUrls: [`./navbar.component.css`],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterLink, CommonModule, RouterLinkActive
  ]
})
export class NavbarComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  isLoggedIn$!: BehaviorSubject<boolean>;
  showAdminBoard$: Observable<boolean> | undefined;
      showUserBoard$: Observable<boolean> | undefined;
      username$: Observable<string | null> | undefined;
      private destroy$ = new Subject<void>();
      user: User | null = null;

  constructor(private tokenStorageService: TokenStorageService, private authService: AuthService, private router: Router) {
          this.isLoggedIn$ = new BehaviorSubject<boolean>(!!this.authService.isLoggedIn$); // Initialize with current status
      }

      ngOnInit(): void {
              const initialLoginStatus = !!this.tokenStorageService.getToken();
              console.log("token is: " +initialLoginStatus);
              this.isLoggedIn$.next(initialLoginStatus);

              this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(isLoggedIn => {
                  if (isLoggedIn) {
                      this.initializeUserObservables();
                  } else {
                      this.resetUserStatus();
                  }
              });
          }

          private initializeUserObservables() {
                  this.tokenStorageService.getUser().pipe(
                      filter((user: User | null) => user !== null), // Filter out null users
                      map((user: User) => { // Now user is guaranteed to be non-null
                          this.user = user;
                          return user;
                      }),
                      catchError((error) => {
                          console.error("Error retrieving user:", error);
                          this.resetUserStatus();
                          return of(null); // Return null to complete the observable
                      })
                  ).subscribe((user: User | null) => { // Keep the null type here for error handling
                      if (user) {
                          this.showAdminBoard$ = of(user.roles?.includes(ADMIN_ROLE) ?? false);
                          this.showUserBoard$ = of((user.roles?.includes(ADMIN_ROLE) || user.roles?.includes(USER_ROLE)) ?? false);
                          this.username$ = of(user.username ?? null);
                      } else {
                          this.resetUserStatus();
                      }
                  });
              }

              private resetUserStatus() {
                  this.showAdminBoard$ = of(false); // Correct assignment
                  this.showUserBoard$ = of(false); // Correct assignment
                  this.username$ = of(null); // Correct assignment
                  this.user = null;
              }

              logout(): void {
                  this.tokenStorageService.signOut();
                  this.isLoggedIn$.next(false);
                  this.router.navigate(['/login']);
                  this.resetUserStatus();
              }

              ngOnDestroy(): void {
                  this.destroy$.next();
                  this.destroy$.complete();
              }

              hasAdminAccess(): boolean {
                  return !!this.user?.roles?.includes(ADMIN_ROLE);
              }

              hasUserAccess(): boolean {
                  return !!this.user?.roles?.includes(USER_ROLE) || !!this.user?.roles?.includes(ADMIN_ROLE);
              }

   opened = false;

  //storage: Storage = localStorage;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
