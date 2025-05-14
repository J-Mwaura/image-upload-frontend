export interface Vehicle {
  id?: number;  // Optional for creation, required for responses
  licensePlate: string;
  make?: string;  // Optional fields marked with ?
  model?: string;
  year?: number;
  productId: number;
  createdAt?: string | Date;  // Commonly included in API responses
  updatedAt?: string | Date;
}
