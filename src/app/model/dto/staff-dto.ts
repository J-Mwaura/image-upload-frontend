
import { UserDTO } from "./user-dto";

export interface StaffDTO {
  id?: number;
  user: UserDTO;
  firstName: string;
  lastName: string;
  fullName?: string;  // Convenience field for UI
  phone: string;
  staffType: StaffType;
  hireDate: string;    // ISO format date
  terminationDate?: string | null;
  isActive: boolean;
  pinCode?: string;    // Only for forms, not for display
  hourlyRate: number;
  deleted?: boolean;
  formattedHourlyRate?: string; // For display purposes
  statusBadge?: string;         // For UI styling
}

// Enum for Staff Types
export type StaffType = 'ATTENDANT' | 'SUPERVISOR' | 'MANAGER';
