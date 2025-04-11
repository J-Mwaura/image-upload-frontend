import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core'; // If using in a component
import { Subject, takeUntil } from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common'; // For managing subscriptions in components

@Component({
  selector: 'app-responsive-layout',
  template: `
    <div *ngIf="isHandset$ | async">Handset view</div>
    <div *ngIf="!(isHandset$ | async)">Web view</div>
  `,
  imports: [
    NgIf,
    AsyncPipe
  ]
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean>;

  private ngUnsubscribe = new Subject<void>();
  constructor(private breakpointObserver: BreakpointObserver) {
    // Initialization of isHandset$ should happen here, after breakpointObserver is injected
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      '(min-width: 960px)' // Custom media query
    ]).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result.matches) {
          console.log('Matches one of the observed breakpoints:', result.breakpoints);
          if (result.breakpoints[Breakpoints.Handset]) {
            console.log('It\'s a handset!');
          }
          if (result.breakpoints[Breakpoints.Tablet]) {
            console.log('It\'s a tablet!');
          }
          if (result.breakpoints['(min-width: 960px)']) {
            console.log('Screen width is 960px or more!');
          }
        } else {
          console.log('No observed breakpoints matched.');
        }
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
