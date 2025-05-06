export interface Page<T> {
  number: any;
  totalElements: any;
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
