import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
private baseUrl = environment.apiUrl + 'api/auth';
  constructor(private request: HttpClient) { }

  login(obj: any) : Observable<any>{
    return this.request.post(`${this.baseUrl}/login`, obj)
  }
}
