import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDTO } from '../model/dto/user-dto';
import { Page } from '../model/page';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl + 'api/home/';
  private userUrl = environment.apiUrl + 'api/user/';


  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userUrl}`).pipe(
      tap(users => console.log('Fetched users')),
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }
  handleError<T>(arg0: string, arg1: never[]): (err: any, caught: Observable<User[]>) =>
    import("rxjs").ObservableInput<any> {
    throw new Error('Method not implemented.');
  }

  getPublicContent(): Observable<any> {
    return this.http.get(`${this.baseUrl}home`, { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(`${this.baseUrl}user`, { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(`${this.baseUrl}mod`, { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(`${this.baseUrl}admin`, { responseType: 'text' });
  }

  

  getAvailableUsers(page: number = 0, size: number = 10, sort: string = 'username', direction: string = 'asc'): Observable<Page<UserDTO>> {
    // Set up query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    return this.http.get<Page<UserDTO>>(this.userUrl, { params });
  }
}
