// staff.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { StaffDTO } from '../model/dto/staff-dto';
import { StaffMapper } from '../model/mapper/staff-mapper';
import { ApiResponse } from '../model/response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}api/staff`;

  constructor(private http: HttpClient) { }

  getAllStaff(page: number = 0, size: number = 10): Observable<ApiResponse<StaffDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<StaffDTO>>(this.apiUrl, { params });
  }

  getStaffById(id: number): Observable<StaffDTO> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(StaffMapper.toDTO)
    );
  }

  createStaff(staff: Partial<StaffDTO>): Observable<StaffDTO> {
    const apiStaffData = StaffMapper.toAPI(staff);
    console.log("creating user " +apiStaffData.userId);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, StaffMapper.toAPI(staff)).pipe(
      map(response => {
        // Check for success flag in the ApiResponse
        if (response.success) {
          // If successful, extract the data part and map it to StaffDTO
          return StaffMapper.toDTO(response.data);
        } else {
          // If 'success' is false (backend returned a business error with 200 OK or other status)
          throw new Error(response.message || 'Unknown error from API');
        }
      }),
      // This catchError handles HTTP errors (e.g., 400, 404, 409, 500 status codes)
      catchError(this.handleError)
    );
  }

  updateStaff(id: number, staff: Partial<StaffDTO>): Observable<StaffDTO> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, StaffMapper.toAPI(staff)).pipe(
      map(StaffMapper.toDTO)
    );
  }

  // Generic error handling method for HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Backend errors with ApiResponse structure
      // If the backend sent an ApiResponse even for HTTP errors, check its 'message' field
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
    } else {
      // Other backend errors (e.g., plain text error, or no specific message)
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Re-throw as an RxJS error
  }
}