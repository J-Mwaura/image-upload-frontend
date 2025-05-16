// src/app/services/impl/booking.service.impl.ts (or just src/app/services/booking.service.ts if not using interface)

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BookingService } from '../booking-service'; // Import the interface (if using)
import { BookingDTO } from '../../model/dto/booking-dto'; // Import the DTO
import { ApiResponse } from '../../model/response/ApiResponse'; // Assuming you have an ApiResponse structure
import { environment } from '../../../environments/environment'; // Assuming environment files for API URL

/**
 * Implementation of the BookingService interface.
 * Handles communication with the backend Booking API.
 */
@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class BookingServiceImpl implements BookingService { // Implement the interface (if using)

  private apiUrl = `${environment.apiUrl}api/booking`; // Base URL for the booking API endpoints

  constructor(private http: HttpClient) { } // Inject Angular's HttpClient

  /**
   * Sends a POST request to create a new booking.
   * @param bookingDto The DTO containing booking details.
   * @returns An Observable of the API response containing the created BookingDTO.
   */
  createBooking(bookingDto: BookingDTO): Observable<ApiResponse<BookingDTO>> {
  // --- Client-side validation ---
  if (!bookingDto.vehicleId && !bookingDto.licensePlate) {
    const errorMessage = "Either vehicleId or licensePlate must be provided for booking.";
    return throwError(() => new Error(errorMessage)); // Early return with error
  }

  // Proceed with HTTP request if validation passes
  return this.http.post<ApiResponse<BookingDTO>>(`${this.apiUrl}`, bookingDto).pipe(
    catchError(this.handleError) // Handle server-side errors
  );
}

  /**
   * Sends a GET request to retrieve all bookings.
   * @returns An Observable of the API response containing a list of BookingDTOs.
   */
  getAllBookings(): Observable<ApiResponse<BookingDTO[]>> {
    // You might want to add pagination/sorting parameters here later
    return this.http.get<ApiResponse<BookingDTO[]>>(`${this.apiUrl}`).pipe(
      catchError(this.handleError) // Add error handling
    );
  }

  /**
   * Sends a GET request to retrieve a booking by its ID.
   * @param bookingId The ID of the booking to retrieve.
   * @returns An Observable of the API response containing the BookingDTO if found.
   */
  getBookingById(bookingId: number): Observable<ApiResponse<BookingDTO>> {
    return this.http.get<ApiResponse<BookingDTO>>(`${this.apiUrl}/${bookingId}`).pipe(
      catchError(this.handleError) // Add error handling
    );
  }

  /**
 * Sends a GET request to search for license plates matching the search term.
 * @param searchTerm The term to search for in license plates.
 * @returns An Observable of the API response containing a Set of matching license plates.
 */
searchLicensePlates(): Observable<ApiResponse<Set<string>>> {
  return this.http.get<ApiResponse<Set<string>>>(`${this.apiUrl}/license-plates`)
    .pipe(
      catchError(this.handleError)
    );
}

  /**
   * Sends a PUT request to update an existing booking.
   * @param bookingId The ID of the booking to update.
   * @param bookingDto The DTO containing updated booking details.
   * @returns An Observable of the API response containing the updated BookingDTO.
   */
  updateBooking(bookingId: number, bookingDto: BookingDTO): Observable<ApiResponse<BookingDTO>> {
    // For update, include the bookingId in the URL and potentially in the body depending on backend
    // The backend controller expects the ID in the path variable.
    // Send the DTO as the request body.
    return this.http.put<ApiResponse<BookingDTO>>(`${this.apiUrl}/${bookingId}`, bookingDto).pipe(
      catchError(this.handleError) // Add error handling
    );
  }

  /**
   * Sends a DELETE request to delete a booking by its ID.
   * @param bookingId The ID of the booking to delete.
   * @returns An Observable of the API response (success/failure).
   */
  deleteBooking(bookingId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${bookingId}`).pipe(
      catchError(this.handleError) // Add error handling
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
