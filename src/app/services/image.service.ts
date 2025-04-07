import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductImage } from "../model/ProductImage.model";
import { environment } from "../../environments/environment";
import { catchError, Observable, tap, throwError } from "rxjs";
import { MessageResponse } from "../model/MessageResponse";


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public addImage(formData: FormData): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.host}api/file/saveFile`, formData);
  }

  postUserData(productImages: ProductImage, files: File[]): FormData {

    let formData = new FormData();
    for (const file of files) {
      formData.append("files", file, file.name);
    }
    return formData;
  }

  getImageList(page: number, size: number): Observable<ProductImage[]> {
    let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
    return this.http.get<ProductImage[]>(`${this.host}api/images/allImages`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
      console.error("An error occurred:", error);
      return throwError(() => new Error("Error deleting or updating image. Please try again later.")); // Return an observable with the error
    }

updateImage(productImage: ProductImage): Observable<any> {
  const url = `${this.host}api/images/${productImage.id}`;
  return this.http.put(url, productImage).pipe(
      catchError(this.handleError)
  );
}

updateImagePartial(id: number, productImage: Partial<ProductImage>): Observable<any> { // For PARTIAL updates (PATCH)
  const url = `${this.host}api/images/${id}`;
  return this.http.put(url, productImage).pipe(
      catchError(this.handleError)
  );
}

delete(productImageId: number): Observable<any> {
  if (!productImageId) {
      return throwError(() => new Error("Product image ID cannot be undefined or null."));
  }

  const url = `${this.host}api/images/${productImageId}`;
  return this.http.delete(url).pipe(
      tap((response: any) => {
          console.log(`Deleted image with id ${productImageId}:`, response);
      }),
      catchError(this.handleError)
  );
}

}
