import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private host = environment.apiUrl;
  private baseUrl = environment.apiUrl + 'api/home/';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}user`).pipe(
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
}
