import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductImage } from "../model/ProductImage.model";
import { environment } from "../../environments/environment";
import { catchError, Observable, tap, throwError } from "rxjs";
import { MessageResponse } from "../model/response/MessageResponse";
import {ApiResponse} from '../model/response/ApiResponse';
import {Page} from '../model/page';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public addImage(formData: FormData): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.host}api/file/saveFile`, formData);
  }

  postUserData(productImages: ProductImage, files: File[], entityType: string): FormData {

    let formData = new FormData();
    for (const file of files) {
      formData.append("files", file, file.name);
    }
    formData.append("entityType", entityType); // Append the entityType
    return formData;
  }

  getImageList(page: number, size: number): Observable<ProductImage[]> {
    let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
    return this.http.get<ProductImage[]>(`${this.host}api/file/allFiles`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getImagesByEntityType(
    entityType: string,
    page: number,
    size: number,
    filter?: string
  ): Observable<ApiResponse<Page<ProductImage> | null>> { // Explicit return type
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('page', (page - 1).toString())
      .set('size', size.toString());

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<ApiResponse<Page<ProductImage> | null>>(
      `${this.host}api/file/by-entity-type`,
      { params: params }
    );
  }

  private handleError(error: any) {
      console.error("An error occurred:", error);
      return throwError(() => new Error("Error deleting or updating image. Please try again later.")); // Return an observable with the error
    }

updateImagePartial(id: number, productImage: Partial<ProductImage>): Observable<any> { // For PARTIAL updates (PATCH)
  const url = `${this.host}api/file/${id}`;
  return this.http.put(url, productImage).pipe(
      catchError(this.handleError)
  );
}

delete(productImageId: number): Observable<any> {
  if (!productImageId) {
      return throwError(() => new Error("Product image ID cannot be undefined or null."));
  }

  const url = `${this.host}api/file/${productImageId}`;
  return this.http.delete(url).pipe(
      tap((response: any) => {
          console.log(`Deleted image with id ${productImageId}:`, response);
      }),
      catchError(this.handleError)
  );
}

}
