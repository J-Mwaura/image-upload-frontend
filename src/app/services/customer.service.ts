import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/ApiResponse';
import { CustomerDto } from '../model/dto/customer-dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = `${environment.apiUrl}api/customer`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<any> {
    return this.http.get<any>(this.apiUrl); 
  }

  searchCustomersByName(name: string): Observable<ApiResponse<CustomerDto[]>> {
    const params = new HttpParams().set('name', name);
    
    return this.http.get<ApiResponse<CustomerDto[]>>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(err => {
        console.error('Search Error:', err);
        return throwError(() => new Error('Failed to search customers'));
      })
    );
  }

     /**
   * Creates a new customer in the backend.
   * @param customerDto The CustomerDto object containing the new customer details.
   * @returns An Observable of ApiResponse containing the newly created CustomerDto.
   */
     createCustomer(customerDto: CustomerDto): Observable<ApiResponse<CustomerDto | null>> { // Expecting ApiResponse<CustomerDto | null>
      const url = `${this.apiUrl}`; // POST request to the base URL
      console.log('Full API URL (createCustomer):', url);
      console.log('Creating customer with data:', customerDto);

      return this.http.post<ApiResponse<CustomerDto | null>>(url, customerDto).pipe( // POST request with customerDto in body
          tap(response => console.log('CustomerService createCustomer Tap:', response)), // Verify response
          catchError(err => {
              console.error('CustomerService createCustomer Error:', err);
              // Extract backend error message if available, otherwise provide a generic one
              const backendErrorMessage = err.error?.message || 'Failed to create customer';
              return throwError(() => new Error(backendErrorMessage)); // Re-throw with a meaningful error
          })
      );
    }
}
