export interface Product {
  id?: number | null;
  price: number;
  name: string;
  description?: string | null;
  mainImageId?: number | null;
  imageIds?: number[];
  categoryId?: number | null;
  productType: string;
  active?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
  itemType: string;
}
