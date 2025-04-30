import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {ProductCategory} from '../model/ProductCategory';
import {environment} from '../../environments/environment';
import { ApiResponse} from '../model/ApiResponse';
import {UpdateProductCategoryDTO} from '../model/update-product-category-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  saveProductCategory(productCategoryDto: ProductCategory): Observable<ApiResponse<ProductCategory>> {
    return this.http.post<ApiResponse<ProductCategory>>(
      `${this.host}api/category/save`,
      productCategoryDto
    );
  }

  getProductCategories(page: number, size: number): Observable<ApiResponse<ProductCategory[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<ProductCategory[]>>(`${this.host}api/category/getCategories`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error && error.error.message) {
        errorMessage = `Backend Error: ${error.error.message}`; // Access the message from ApiResponse
      } else {
        errorMessage = `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  updateProductCategory(id: number | null | undefined, updatePayload: UpdateProductCategoryDTO): Observable<ApiResponse<ProductCategory>> {
    return this.http.put<ApiResponse<ProductCategory>>(`${this.host}api/category/${id}`, updatePayload);
  }

  public deleteProductCategory(id: number): Observable<ApiResponse<ProductCategory>> {
    return this.http.delete<ApiResponse<ProductCategory>>(`${this.host}api/category/${id}`);
  }
}
