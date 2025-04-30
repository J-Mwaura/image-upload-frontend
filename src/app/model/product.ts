export interface Product {
    id?: number | null;
    itemType: string;
    name?: string;
    make?: string;
    model?: string;
    licensePlate?: string;
    description?: string;
    serialNumber?: string;
    notes?: string;
    mainImageId?: number;     
    imageIds?: number[]; 
  }
