import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehicleDTO } from '../model/dto/vehicle-dto';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../model/page';
import { ApiResponse } from '../model/response/ApiResponse';
import { Vehicle } from '../model/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private baseUrl = `${environment.apiUrl}api/vehicle`; 

  constructor(private http: HttpClient) {}

  // Create or update vehicle
  saveOrUpdateVehicle(vehicle: VehicleDTO): Observable<VehicleDTO> {
    return vehicle.licensePlate 
      ? this.http.put<VehicleDTO>(`${this.baseUrl}/${vehicle.licensePlate}`, vehicle)
      : this.http.post<VehicleDTO>(this.baseUrl, vehicle);
  }

  // Get by license plate
  findByLicensePlate(licensePlate: string): Observable<VehicleDTO> {
    return this.http.get<VehicleDTO>(`${this.baseUrl}/${licensePlate}`);
  }

  // Search license plates
  findMatchingLicensePlates(query: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/search`, 
      { params: new HttpParams().set('query', query) }
    );
  }

  // Advanced search
  findByLicensePlateContaining(searchTerm: string): Observable<VehicleDTO[]> {
    return this.http.get<VehicleDTO[]>(
      `${this.baseUrl}/search/advanced`,
      { params: new HttpParams().set('searchTerm', searchTerm) }
    );
  }

  // Delete vehicle
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Get by ID
  findById(id: number): Observable<VehicleDTO> {
    return this.http.get<VehicleDTO>(`${this.baseUrl}/id/${id}`);
  }

  // Paginated list
  getAllVehicles(page: number = 0, size: number = 10): Observable<Page<VehicleDTO>> {
    return this.http.get<Page<VehicleDTO>>(
      this.baseUrl,
      { params: new HttpParams().set('page', page).set('size', size) }
    );
  }

   /**
   * Sends a GET request to search for license plates matching the search term.
   * @param searchTerm The term to search for in license plates.
   * @returns An Observable of the API response containing a Set of matching license plates.
   */
  searchLicensePlates(searchTerm: string): Observable<ApiResponse<Set<string>>> {
        const params = new HttpParams().set('searchTerm', searchTerm); // Match backend parameter name
        return this.http.get<ApiResponse<Set<string>>>(`${this.baseUrl}/license-plates`, { params })
           .pipe(
             catchError(this.handleError) // Assuming handleError returns a compatible ApiResponse Observable
           );
   }

  /**
   * Search vehicles by license plate (case-insensitive partial match)
   * @param searchTerm Partial license plate to search for
   * @returns Observable of Vehicle Set wrapped in ApiResponse
   */
 searchVehicleLicensePlate(searchTerm: string): Observable<ApiResponse<Set<VehicleDTO>>> { // <<< Corrected return type to match backend ApiResponse<Set<VehicleDTO>>
  if (!searchTerm || searchTerm.trim().length < 2) {
    // Return an ApiResponse with an empty data and a message for client-side validation failure
    return of({
      message: 'Minimum 2 characters required for search.',
      success: false, // Indicate failure for client-side validation
      data: new Set<VehicleDTO>() // <<< Changed payload to data
    });
  }

  const params = new HttpParams()
    .set('licensePlate', searchTerm.trim()); // Match the backend @RequestParam name

  return this.http.get<ApiResponse<Set<VehicleDTO>>>( // <<< Expecting ApiResponse<Set<VehicleDTO>>
    `${this.baseUrl}/search`, // Ensure this URL matches your backend endpoint path
    { params }
  ).pipe(
    catchError(error => {
      console.error('Search failed:', error);
      // Use the handleError method to return an ApiResponse with error details
      // Assuming handleError returns Observable<ApiResponse<any>> or similar
      // We need to ensure the returned type is compatible with Observable<ApiResponse<Set<VehicleDTO>>>
      // A simple way is to return an ApiResponse with an empty Set data on error
       let errorMessage = 'Search failed. Please try again.';
       if (error instanceof HttpErrorResponse && error.error && error.error.message) {
           errorMessage = `Backend Error: ${error.error.message}`;
       } else if (error instanceof Error) {
           errorMessage = `Client Error: ${error.message}`;
       }


      return of({ // Return an Observable emitting an ApiResponse
         message: errorMessage,
         success: false,
         data: new Set<VehicleDTO>() // <<< Changed payload to data
      } as ApiResponse<Set<VehicleDTO>>); // Cast to the expected type
    })
  );
}


  /**
   * Handles HTTP errors.
   * @param error The HttpErrorResponse.
   * @returns An Observable that throws a new Error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error && error.error.message) {
        // Use the message from your backend's ApiResponse structure
        errorMessage = `Backend Error: ${error.error.message}`;
      } else {
        errorMessage = `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage);
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
