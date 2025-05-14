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
   * Sends a request to retrieve all bookings.
   * @returns An Observable of the API response containing a list of BookingDTOs.
   */
  getAllBookings(): Observable<ApiResponse<BookingDTO[]>>;
  /**
   * Sends a request to retrieve a booking by its ID.
   * @param bookingId The ID of the booking to retrieve.
   * @returns An Observable of the API response containing the BookingDTO if found.
   */
  getBookingById(bookingId: number): Observable<ApiResponse<BookingDTO>>;
  /**
   * Sends a request to search for license plates matching a search term.
   * @param searchTerm The term to search for in license plates.
   * @returns An Observable of the API response containing a Set of matching license plates.
   */
  searchLicensePlates(searchTerm: string): Observable<ApiResponse<Set<string>>>;

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


 }
