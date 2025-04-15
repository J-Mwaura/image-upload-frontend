export interface ProductDto {
    id: number | null; // Assuming ID can be null before creation
    customerId: number | null; // Assuming customerId can be null or not yet assigned
    itemType: string;
    make: string;
    model: string;
    licensePlate?: string; // Optional as per previous discussion
    description?: string; // Optional
    serialNumber?: string; // Optional
    notes?: string; 
    department?: string;
  }