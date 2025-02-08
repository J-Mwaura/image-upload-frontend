import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChoiceUrlsComponent } from "../navbar-c/choice-urls/choice-urls.component";

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
    RouterLink, RouterLinkActive,
    ChoiceUrlsComponent,
    CommonModule
]
})
export class NavbarComponent {
  private breakpointObserver = inject(BreakpointObserver);

   opened = false;

  storage: Storage = localStorage;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
