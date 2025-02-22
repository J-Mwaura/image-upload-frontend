import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, Router, RouterModule } from '@angular/router';
import { TokenStorageService } from '../../services/tokenStorageService';
import { BehaviorSubject, Observable, takeUntil, of, Subject } from 'rxjs';
import { User } from '../../model/user';
import { catchError, filter, map } from 'rxjs/operators';
import { AuthService } from '../../services/authService';

const USER_ROLE = 'USER';
const ADMIN_ROLE = 'ADMIN';

@Component({
    standalone: true,
    selector: 'app-choice-urls',
    templateUrl: './choice-urls.component.html',
    styleUrls: ['./choice-urls.component.css'],
    imports: [CommonModule, MatListModule, RouterLink, RouterLinkActive, RouterModule]
})
export class ChoiceUrlsComponent implements OnInit, OnDestroy {
    isLoggedIn$!: BehaviorSubject<boolean>;
    showAdminBoard$: Observable<boolean> | undefined;
    showUserBoard$: Observable<boolean> | undefined;
    username$: Observable<string | null> | undefined;
    private destroy$ = new Subject<void>();
    user: User | null = null;
    showTheAdminBoard$!: any;
    user$: Observable<User | null> | undefined;
    
    constructor(private tokenStorageService: TokenStorageService, public authService: AuthService, private router: Router) { 
        this.isLoggedIn$ = new BehaviorSubject<boolean>(!!this.authService.isLoggedIn$); // Initialize with current status
    }

    ngOnInit(): void {
        this.showTheAdminBoard$ = this.authService.showAdminBoard$;
        const initialLoginStatus = !!this.tokenStorageService.getToken();
        this.isLoggedIn$.next(initialLoginStatus);

        this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.initializeUserObservables();
            } else {
                this.resetUserStatus();
            }
        });
        this.user$ = this.tokenStorageService.getUser();
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
}