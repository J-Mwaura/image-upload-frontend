export interface Product {
    id?: number; 
    customer?: { id: number };
    itemType: string;
    make?: string;
    model?: string;
    licensePlate?: string;
    description?: string;
    serialNumber?: string;
    notes?: string;
  }
