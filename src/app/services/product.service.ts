import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDto } from '../model/dto/product-dto'; // Assuming ProductDto is the DTO matching the Product interface structure
import { UpdateProductDto } from '../model/dto/update-product-dto'; // Adjust the path to your update DTO model
import { Page } from '../model/page'; // Assuming you have a Page model
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/ApiResponse'; // Assuming you use ApiResponse for standard responses

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  
  private apiUrl = `${environment.apiUrl}api/product`;

  constructor(private http: HttpClient) {}

  /**
   * Fetches a paginated list of all products from the backend.
   * @param page The page number (0-based).
   * @param size The number of items per page.
   * @returns An Observable of a Page containing ProductDto objects wrapped in ApiResponse.
   */
  // Updated return type to expect ApiResponse<Page<ProductDto>> based on common backend structure
  getAllProducts(page: number, size: number): Observable<ApiResponse<Page<ProductDto>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    // Assuming the backend returns ApiResponse<Page<ProductDto>> for this endpoint
    return this.http.get<ApiResponse<Page<ProductDto>>>(this.apiUrl, { params });
  }

  /**
   * Retrieves a product by its unique ID from the backend.
   * @param id The ID of the product.
   * @returns An Observable of ApiResponse containing the ProductDto if found, otherwise ApiResponse with null data.
   */
  // Updated return type to expect ApiResponse<ProductDto | null>
  getProductById(id: number): Observable<ApiResponse<ProductDto | null>> {
    // Assuming the backend returns ApiResponse<ProductDto | null> for this endpoint
    return this.http.get<ApiResponse<ProductDto | null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Sends a request to create a new product on the backend.
   * @param productDto The DTO containing the product data.
   * @returns An Observable of ApiResponse containing the created ProductDto.
   */
  // Updated return type to expect ApiResponse<ProductDto>
  createProduct(productDto: ProductDto): Observable<ApiResponse<ProductDto>> {
    // Assuming the backend returns ApiResponse<ProductDto> for this endpoint
    return this.http.post<ApiResponse<ProductDto>>(`${this.apiUrl}/save`, productDto); // Assuming POST to base URL for creation
  }

  /**
   * Sends a request to update an existing product on the backend.
   * @param id The ID of the product to update.
   * @param updateProductDto The DTO containing the updated product data.
   * @returns An Observable of ApiResponse containing the updated ProductDto if found, otherwise ApiResponse with null data.
   */
  // Updated return type to expect ApiResponse<ProductDto | null>
  updateProduct(id: number, updateProductDto: UpdateProductDto): Observable<ApiResponse<ProductDto | null>> {
    // Assuming the backend returns ApiResponse<ProductDto | null> for this endpoint
    return this.http.put<ApiResponse<ProductDto | null>>(`${this.apiUrl}/${id}`, updateProductDto);
  }

  /**
   * Sends a request to delete a product on the backend.
   * @param id The ID of the product to delete.
   * @returns An Observable of ApiResponse indicating success or failure.
   */
  // Updated return type to expect ApiResponse<any> (or specific success/error structure)
  deleteProduct(id: number): Observable<ApiResponse<any>> {
    // Assuming the backend returns ApiResponse<any> or similar for deletion status
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Commented out as this method is not present in the latest backend ProductService interface
  // getProductByLicensePlate(licensePlate: string): Observable<ProductDto | null> {
  //   return this.http.get<ProductDto>(`${this.apiUrl}/license/${licensePlate}`);
  // }

  //Commented out as this method is not present in the latest backend ProductService interface
  searchProducts(query: string, page: number, size: number): Observable<Page<ProductDto>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ProductDto>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Fetches a paginated list of products belonging to a specific category from the backend.
   * Corresponds to the getProductsByCategory method in the backend service.
   * @param categoryId The ID of the category.
   * @param pageable Pagination and sorting information.
   * @returns An Observable of ApiResponse containing a Page of ProductDto objects.
   */
  // Added method to match the backend ProductService interface
  // getProductsByCategory(categoryId: Long, pageable: Pageable): Observable<ApiResponse<Page<ProductDto>>> {
  //    const params = new HttpParams()
  //      .set('page', pageable.pageNumber.toString())
  //      .set('size', pageable.pageSize.toString());
  //    // Assuming the backend endpoint is /api/product/category/{categoryId}
  //    return this.http.get<ApiResponse<Page<ProductDto>>>(`${this.apiUrl}/category/${categoryId}`, { params });
  // }


  /**
   * Retrieves the URL for a specific image ID from the backend file service.
   * This method is kept as it seems like a utility for fetching image URLs.
   * @param imageId The ID of the image.
   * @returns An Observable of the image URL string.
   */
  // Note: The return type might need to be adjusted if the backend wraps the URL in an ApiResponse
  getImageUrl(imageId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}files/${imageId}`);
  }

}
