import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TokenStorageService } from '../../services/tokenStorageService';
import { BehaviorSubject, Observable, takeUntil, of, Subject } from 'rxjs';

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
    private destroy$ = new Subject<void>();
    isLoggedIn$ = new BehaviorSubject<boolean>(false);
    showAdminBoard$?: Observable<boolean> ;
    showUserBoard$?: Observable<boolean>;
    username$?: Observable<string | null>; // Make username an Observable

    constructor(private tokenStorageService: TokenStorageService, private router: Router) { }

    ngOnInit(): void {
      const initialLoginStatus = !!this.tokenStorageService.getToken(); // Get initial status *synchronously*
      this.isLoggedIn$ = new BehaviorSubject<boolean>(initialLoginStatus); // Set the initial value

      this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe(isLoggedIn => { // Subscribe as before
          if (isLoggedIn) {
              const user = this.tokenStorageService.getUser();
              this.showAdminBoard$ = of(user?.roles?.includes(ADMIN_ROLE) ?? false);
              this.showUserBoard$ = of((user?.roles?.includes(ADMIN_ROLE) || user?.roles?.includes(USER_ROLE)) ?? false);
              this.username$ = of(user?.username ?? null);
          } else {
            this.showAdminBoard$ = of(false);
            this.showUserBoard$ = of(false);
            this.username$ = of(null);
          }
      });
  }

    logout(): void {
        this.tokenStorageService.signOut();
        this.isLoggedIn$.next(false);
        this.router.navigate(['/login']);
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
}