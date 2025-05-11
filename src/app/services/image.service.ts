import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductImage } from "../model/ProductImage.model";
import { environment } from "../../environments/environment";
import { catchError, Observable, of, throwError } from "rxjs";
import { MessageResponse } from "../model/response/MessageResponse";
import {ApiResponse} from '../model/response/ApiResponse';
import {Page} from '../model/page';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private host = `${environment.apiUrl}api/file`;

  constructor(private http: HttpClient) { }

  public addImage(formData: FormData): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.host}/saveFile`, formData);
  }

  postUserData(productImages: ProductImage, files: File[], entityType: string): FormData {

    let formData = new FormData();
    for (const file of files) {
      formData.append("files", file, file.name);
    }
    formData.append("entityType", entityType);
    return formData;
  }

  getImageList(page: number, size: number): Observable<ProductImage[]> {
    let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
    return this.http.get<ProductImage[]>(`${this.host}/allFiles`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getImagesByEntityType(
    entityType: string,
    page: number,
    size: number,
    filter?: string
  ): Observable<ApiResponse<Page<ProductImage> | null>> {
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('page', (page - 1).toString())
      .set('size', size.toString());

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<ApiResponse<Page<ProductImage> | null>>(
      `${this.host}/by-entity-type`,
      { params: params }
    );
  }

  private handleError(error: any) {
      return throwError(() => new Error("Error deleting or updating image. Please try again later."));
    }

updateImagePartial(id: number, productImage: Partial<ProductImage>): Observable<any> { // For PARTIAL updates (PATCH)
  const url = `${this.host}/${id}`;
  return this.http.put(url, productImage).pipe(
      catchError(this.handleError)
  );
}

deleteImage(productImageId: number): Observable<ApiResponse<void>> {
  if (typeof productImageId !== 'number') {
    return throwError(() => new Error('Invalid image ID'));
  }
  return this.http.delete<ApiResponse<void>>(`${this.host}/${productImageId}`).pipe(
    catchError((error: HttpErrorResponse) => {
      let message: string;
      
      switch(error.status) {
        case 404:
          message = error.error?.message || 'Image not found';
          break;
        case 409:
          message = error.error?.message || 'Image is currently in use';
          break;
        case 500:
          message = error.error?.message || 'Internal server error';
          break;
        default:
          message = error.error?.message || 'Failed to delete image';
      }

      return of({
        success: false,
        message,
        data: null
      });
    })
  );
}

}
