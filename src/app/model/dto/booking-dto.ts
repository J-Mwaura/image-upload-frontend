import { BookingStatus, PaymentMethodType, PaymentStatus } from '../../model/booking'; // Assuming booking.model.ts contains the enums

/**
 * Updated Data Transfer Object for Booking information,
 * reflecting the structure of the backend Booking entity and 'bookings' table.
 * This DTO now represents an immediate carwash job instance.
 */
export interface BookingDTO {
  bookingId?: number; // Corresponds to the 'id' primary key (optional for creation)
  productId: number; // Corresponds to 'product_id'
  customerId?: number; // Corresponds to 'customer_id' (optional)
  staffId?: number; // Corresponds to 'staff_id' (Attendant assigned, optional)
  vehicleId?: number;
  customerName?: string | null;
  licensePlate?: string | null; 
  scheduledTime?: string | null;
  createdAt?: string; // Corresponds to 'created_at' (Booking/Job creation time) - string for ISO 8601 timestamp
  status: BookingStatus; // Corresponds to 'status' (Job status) - Use the imported enum type
  paymentStatus: PaymentStatus; // Corresponds to 'payment_status' (Payment status for the job) - Use the imported enum type
  paymentMethod?: PaymentMethodType; // Corresponds to 'payment_method' (optional) - Use the imported enum type

  startedAt?: string | null; // Corresponds to 'started_at' (optional, can be null) - string for timestamp
  completedAt?: string | null; // Corresponds to 'completed_at' (optional, can be null) - string for timestamp

  estimatedDurationMinutes?: number | null; // Corresponds to 'estimated_duration_minutes' (optional, can be null)
  actualDurationMinutes?: number | null; // Corresponds to 'actual_duration_minutes' (optional, can be null)

  priceCharged: number; // Corresponds to 'price_charged' (Actual price) - using number for currency in TS
  commissionRate?: number; // Corresponds to 'commission_rate' (optional)
  commissionCalculated?: number | null; // Corresponds to 'commission_calculated' (optional, can be null)

  notes?: string | null; // Corresponds to 'notes' (optional, can be null)
  jobType?: string; // Corresponds to 'job_type' (optional)
}


// import { BookingStatus, PaymentStatus } from '../../model/booking'; // Assuming booking.model.ts contains the enums

// /**
//  * Data Transfer Object for Booking information.
//  * Used for transferring booking data between the Angular frontend and the backend API.
//  */
// export interface BookingDTO {
//   bookingId?: number; // Optional for creation, will be assigned by the backend
//   productId: number;
//   customerId?: number; // Optional
//   bookingTime?: string; // String representation of timestamp (ISO 8601) - backend generates for creation
//   scheduledTime?: string | null; // String representation of timestamp (ISO 8601), can be null
//   status: BookingStatus; // Use the imported enum
//   paymentStatus: PaymentStatus; // Use the imported enum
//   notes?: string; // Optional
// }
