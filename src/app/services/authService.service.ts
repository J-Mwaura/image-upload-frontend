import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { LoginRequest } from '../model/LoginRequest ';
import { JwtResponse } from '../model/JwtResponse ';
import { environment } from '../../environments/environment';
import { RegisterRequest } from '../model/RegisterRequest';
import { TokenStorageService } from './tokenStorageService';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + 'api/auth';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
      return this.http.post<JwtResponse>(`${this.baseUrl}/login`, loginRequest, { withCredentials: true, headers: this.headerOptions })
        .pipe(
          catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
      let errorMessage = 'Login failed. Please try again.';
  
      if (error.error) {
        const backendError = error.error;
  
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        } else if (backendError && backendError.message) {
          errorMessage = backendError.message;
        } else if (error.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (error.status === 403) {
          errorMessage = 'Forbidden. You do not have permission to access this resource.';
        } else if (error.status === 400) {
          errorMessage = 'Bad Request. Check your inputs.';
        } else if (error.status === 500) {
          errorMessage = 'Internal Server Error. Please try again later.';
        }
      } else if (error.status === 0) {
        errorMessage = 'A client-side or network error occurred. Please check your connection.';
      }
  
      return throwError(() => new Error(errorMessage));
    }
  
  headerOptions = new HttpHeaders({ 'Content-Type': 'application/json' 
  });

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, registerRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => { // Type the error as HttpErrorResponse
          //console.error('Registration error:', error);

          let errorMessage = 'Registration failed. Please try again.'; // Default message

          if (error.error) { // Check if the error response body exists
            const backendError = error.error;

            if (backendError.errors && Array.isArray(backendError.errors)) {
              errorMessage = backendError.errors.join('\n'); // Display multiple errors (from List)
            } else if (backendError.message) {
              errorMessage = backendError.message; // General message
            } else if (typeof backendError === 'string') {
              errorMessage = backendError;
            } else if (error.status === 400) {
              errorMessage = "Bad Request. Please check your inputs.";
            } 
            if (error.status === 409) { // Conflict (409)
              if (backendError.errors && backendError.errors.includes("Username already exists")) {
                  errorMessage = "Username already exists.";
              } else if (backendError.errors && backendError.errors.includes("Email already exists")) {
                  errorMessage = "Email already exists.";
              } else {
                errorMessage = "A conflict occurred during registration. Please check your input."; // Generic conflict message
              }// ... other status code handling

          } else if (error.status === 0) {
            errorMessage = 'A client-side or network error occurred. Please check your connection.';
          }
        }

          return throwError(() => new Error(errorMessage)); // Re-throw the error with the formatted message
        })
      );
    }

}