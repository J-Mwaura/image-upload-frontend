export interface VehicleDTO {
  id?:number;
  licensePlate: string;  // Required - matches @NotBlank in Spring
  make?: string;        // Optional - matches nullable field
  model?: string;       // Optional - matches nullable field
  year?: number;        // Optional - matches nullable field
  productId: number;    // Required - matches non-nullable field in Spring
}