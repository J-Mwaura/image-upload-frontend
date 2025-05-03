import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from '../model/LoginRequest ';
import { JwtResponse } from '../model/response/JwtResponse ';
import { environment } from '../../environments/environment';
import { RegisterRequest } from '../model/RegisterRequest';
import { TokenStorageService } from './tokenStorageService';
import { User } from '../model/user';
import {MatSnackBar} from '@angular/material/snack-bar';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl + 'api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  // Dollar sign used to indicate an observable. Not a must
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  private showAdminBoardSubject = new BehaviorSubject<boolean>(false);
  public showAdminBoard$ = this.showAdminBoardSubject.asObservable();
  private readonly ADMIN_ROLE = 'ADMIN';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService, private snackBar: MatSnackBar) {
     const storedLoginStatus = tokenStorage.getToken();
     this.isLoggedInSubject.next(storedLoginStatus === 'true');
  }

  updateLoginStatus(status: boolean) {
    this.isLoggedInSubject.next(status);
}

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, loginRequest, { withCredentials: true, headers: this.headerOptions })
      .pipe(
        tap((jwtResponse: JwtResponse) => {
          if (jwtResponse && jwtResponse.token && jwtResponse.user) {
            this.tokenStorage.saveToken(jwtResponse.token);
            this.tokenStorage.saveUser(jwtResponse.user);
            this.isLoggedInSubject.next(true);
          }
        }),
        catchError(this.handleError)
      );
  }

  isAdmin(user: User | null): boolean {
    return user?.roles?.includes('ADMIN') ?? false;
  }

  isUser(user: User | null): boolean {
    return user?.roles?.includes('USER') ?? false;
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred. Please try again.';

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

    this.snackBar.open(errorMessage, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    return throwError(() => new Error(errorMessage));
  }

  headerOptions = new HttpHeaders({ 'Content-Type': 'application/json'
  });

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, registerRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => {


          let errorMessage = 'Registration failed. Please try again.';

          if (error.error) {
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
            if (error.status === 409) {
              if (backendError.errors && backendError.errors.includes("Username already exists")) {
                  errorMessage = "Username already exists.";
              } else if (backendError.errors && backendError.errors.includes("Email already exists")) {
                  errorMessage = "Email already exists.";
              } else {
                errorMessage = "A conflict occurred during registration. Please check your input.";
              }

          } else if (error.status === 0) {
            errorMessage = 'A client-side or network error occurred. Please check your connection.';
          }
        }

          return throwError(() => new Error(errorMessage));
        })
      );
    }

    refreshToken(refreshToken: string): Observable<any> {
      const headers = new HttpHeaders({
          'Content-Type': 'application/json'
      });

      return this.http.post(`${this.baseUrl}/refresh-token`, { refreshToken }, { withCredentials: true, headers })
          .pipe(
              catchError(this.handleError)
          );
  }
}
