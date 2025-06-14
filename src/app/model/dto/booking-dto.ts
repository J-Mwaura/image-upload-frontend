import { BookingStatus, PaymentMethodType, PaymentStatus } from '../../model/booking'; 
import { StaffDTO } from './staff-dto';

export interface BookingDTO {
  id?: number; 
  productId: number; 
  customerId?: number; 
  staffId?: number;
  vehicleId?: number;
  customerName?: string | null;
  licensePlate?: string | null; 
  scheduledTime?: string | null;
  createdAt?: string; 
  status: BookingStatus; 
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethodType;

  startedAt?: string | null;
  completedAt?: string | null;

  estimatedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;

  priceCharged: number; 
  commissionRate?: number;
  commissionCalculated?: number | null;

  notes?: string | null; 
  jobType?: string; 

  staff?: StaffDTO | null;
}
