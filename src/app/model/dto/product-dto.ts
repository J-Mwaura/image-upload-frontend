export interface ProductDto {
  id?: number | null;
  itemType: string;
  name?: string;
  make: string;
  model: string;
  licensePlate?: string; // Optional as per previous discussion
  description?: string; // Optional
  serialNumber?: string; // Optional
  notes?: string;
  department?: string;
  mainImageId?: number;
  imageIds?: number[];
  mainImageUrl?: string | null; 
  otherImageUrls?: string[] | null; 
}