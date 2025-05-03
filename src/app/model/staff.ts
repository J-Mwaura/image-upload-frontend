// staff.model.ts
export interface Staff {
    id?: number;
    user: {
      id: number;
      username: string;
      email: string;
    };
    firstName: string;
    lastName: string;
    phone: string;
    staffType: 'ATTENDANT' | 'SUPERVISOR' | 'MANAGER';
    hireDate: string; // ISO format date
    terminationDate?: string;
    isActive: boolean;
    pinCode: string;
    hourlyRate: number;
    deleted?: boolean;
  }