import { BookingStatus, PaymentStatus } from '../../model/booking'; // Assuming booking.model.ts contains the enums

/**
 * Data Transfer Object for Booking information.
 * Used for transferring booking data between the Angular frontend and the backend API.
 */
export interface BookingDTO {
  bookingId?: number; // Optional for creation, will be assigned by the backend
  productId: number;
  customerId?: number; // Optional
  bookingTime?: string; // String representation of timestamp (ISO 8601) - backend generates for creation
  scheduledTime?: string | null; // String representation of timestamp (ISO 8601), can be null
  status: BookingStatus; // Use the imported enum
  paymentStatus: PaymentStatus; // Use the imported enum
  notes?: string; // Optional
}