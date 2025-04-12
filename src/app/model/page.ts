export interface Page<T> {
  content: T[];         // The list of items on the current page
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
