import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = `${environment.apiUrl}api/customer`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<any> {
    return this.http.get<any>(this.apiUrl); 
  }
}
