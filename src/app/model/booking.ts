export interface Booking {

    bookingId: number;
    productId: number;
    customerId?: number;
    bookingTime: string; 
    scheduledTime?: string | null; 
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'UNPAID' | 'PAID' | 'PENDING' | 'FAILED';
  }
  
  // Enums for better type safety
  export enum BookingStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    PENDING = 'PENDING',
    FAILED = 'FAILED'
  }

  export enum PaymentMethodType {
    CASH = 'CASH',
    CARD = 'CARD',
    MOBILE_MONEY = 'MOBILE_MONEY',
    OTHER = 'OTHER'
  }
