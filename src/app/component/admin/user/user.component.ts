import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: `./user.component.css`
})
export class UserComponent {
   private host = environment.apiUrl;
    displayedColumns: string[] = ['email', 'username', 'id', 'action', 'edit'];
    private titleSubject = new BehaviorSubject<string>('Images');
      public titleAction$ = this.titleSubject.asObservable();
   

}
