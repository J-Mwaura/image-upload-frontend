import { Observable } from 'rxjs';
import { BookingDTO } from '../model/dto/booking-dto'; // Import the DTO
import { ApiResponse } from '../model/response/ApiResponse' ; 

/**
 * Interface for the Booking Service.
 * Defines the contract for managing Booking operations in the Angular frontend.
 */
export interface BookingService {

  /**
   * Sends a request to create a new booking.
   * @param bookingDto The DTO containing booking details.
   * @returns An Observable of the API response containing the created BookingDTO.
   */
  createBooking(bookingDto: BookingDTO): Observable<ApiResponse<BookingDTO>>;
  /**
   * Sends a request to retrieve a booking by its ID.
   * @param bookingId The ID of the booking to retrieve.
   * @returns An Observable of the API response containing the BookingDTO if found.
   */
  getBookingById(bookingId: number): Observable<ApiResponse<BookingDTO>>;

  /**
   * Sends a request to update an existing booking.
   * @param bookingId The ID of the booking to update.
   * @param bookingDto The DTO containing updated booking details.
   * @returns An Observable of the API response containing the updated BookingDTO.
   */
  updateBooking(bookingId: number, bookingDto: BookingDTO): Observable<ApiResponse<BookingDTO>>;

  /**
   * Sends a request to delete a booking by its ID.
   * @param bookingId The ID of the booking to delete.
   * @returns An Observable of the API response (success/failure).
   */
  deleteBooking(bookingId: number): Observable<ApiResponse<any>>; // Or ApiResponse<void> depending on backend response

  /**
   * Sends a request to retrieve all bookings.
   * @returns An Observable of the API response containing a list of BookingDTOs.
   */
  getAllBookings(): Observable<ApiResponse<BookingDTO[]>>;

  /**
   * Sends a request to search for distinct license plates matching a search term.
   * @param searchTerm The term to search for.
   * @returns An Observable of the API response containing an array of matching license plate strings.
   */
  searchLicensePlates(searchTerm: string): Observable<ApiResponse<string[]>>; // Added method for license plate search

  /**
   * Sends a request to retrieve all distinct license plates from the system.
   * @returns An Observable of the API response containing an array of all license plate strings.
   */
  getAllLicensePlates(): Observable<ApiResponse<string[]>>;

  // Add other methods as needed, e.g., getBookingsByCustomerId, updateBookingStatus, etc.
}
