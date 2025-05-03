import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import{ProductDto} from '../model/dto/product-dto';
import { UpdateProductDto } from '../model/dto/update-product-dto'; // Adjust the path to your update DTO model
import { Page } from '../model/page'; // Assuming you have a Page model
import {environment} from '../../environments/environment';
import { ProductCategory } from '../model/ProductCategory';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private host = environment.apiUrl;
  private apiUrl = `${this.host}api/product`;

  constructor(private http: HttpClient) {}

  getAllProducts(page: number, size: number): Observable<Page<ProductDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ProductDto>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<ProductDto | null> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`);
  }

  createProduct(productDto: ProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.apiUrl}/save`, productDto);
  }

  updateProduct(id: number, updateProductDto: UpdateProductDto): Observable<ProductDto | null> {
    return this.http.put<ProductDto>(`${this.apiUrl}/${id}`, updateProductDto);
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  getProductByLicensePlate(licensePlate: string): Observable<ProductDto | null> {
    return this.http.get<ProductDto>(`${this.apiUrl}/license/${licensePlate}`);
  }

  searchProducts(query: string, page: number, size: number): Observable<Page<ProductDto>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ProductDto>>(`${this.apiUrl}/search`, { params });
  }

  getImageUrl(imageId: number): Observable<string> {
    return this.http.get<string>(`${this.host}files/${imageId}`);
  }
  
}