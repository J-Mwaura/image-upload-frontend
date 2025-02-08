import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductImage } from "../model/ProductImage.model";
import { environment } from "../../environments/environment";
import { catchError, Observable, tap, throwError } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private host = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  public addImage(formData: FormData): Observable<ProductImage> {
    return this.http.post<ProductImage>(`${this.host}api/file/saveFile`, formData);
  }

  postUserData(productImages: ProductImage, files: File[]): FormData {
    
    let formData = new FormData();

    // The following two lines are used only when saving more data alongside the image
    // formData.append('userName', productImages.userName!);
    // formData.append('email', productImages.email!);
    for (const file of files) {
      formData.append("files", file, file.name);
    }
    return formData;
  }

  getImageList(): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.host}api/images/allImages`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) { // Generic error handler
      console.error("An error occurred:", error);
      return throwError(() => new Error("Error deleting or updating image. Please try again later.")); // Return an observable with the error
    }

    // In your image.service.ts:

updateImage(productImage: ProductImage): Observable<any> { // For FULL updates (PUT)
  const url = `${this.host}api/images/${productImage.id}`;
  return this.http.put(url, productImage).pipe(
      catchError(this.handleError)
  );
}

updateImagePartial(id: number, productImage: Partial<ProductImage>): Observable<any> { // For PARTIAL updates (PATCH)
  const url = `${this.host}api/images/${id}`; // id is passed separately
  return this.http.patch(url, productImage).pipe(
      catchError(this.handleError)
  );
}

delete(productImageId: number): Observable<any> {  // Takes the ID
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



  // public delete(productImage: ProductImage): void {
  //   const url = `${this.host}api/images/${productImage.id}`;
  //   console.log("Deleted image with id " + productImage.id);
  //   this.http.delete(url).subscribe((response: any) => {
  //     console.log("Deleted image with id " + productImage.id + " " + response);
  //     //this.refreshImageTable();
  //     this.getImageList();
  //   })
  // }

}