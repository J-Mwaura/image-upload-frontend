import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {NgForm,
  FormBuilder, FormControl, FormGroup, FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductImage } from '../model/ProductImage.model';
import { ImageService } from '../services/image.service';
import { BehaviorSubject, catchError, Observable, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../environments/environment';
import { PagedResponse } from '../model/paged-response-model';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfirmDeleteDialogComponent } from '../component/dialog/confirm-delete-dialog-component/confirm-delete-dialog-component.component';

interface ImageToUpdate {
  id: number | null;
  name: string;
  location: string; // Or File[]
}

@Component({
  selector: 'app-image',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule, 
    MatFormFieldModule, MatInputModule, MatDialogModule, ConfirmDeleteDialogComponent],
  standalone: true,

  templateUrl: './image.component.html',
  styleUrl: `./image.component.css`
})

export class ImageComponent implements OnInit {
  imageToUpdate: ImageToUpdate = {
    id: null,
    name: "",
    location: ""
  };
  private host = environment.apiUrl;
  displayedColumns: string[] = ['name', 'location', 'id', 'action', 'edit'];
  page: number = 0;
  size: number = 4;
  totalCount: number = 0;
  private titleSubject = new BehaviorSubject<string>('Images');
  public titleAction$ = this.titleSubject.asObservable();

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  public term!: string;
  productImages: Array<ProductImage> = [];
  public imageName!: string;
  public fileName!: string;
  public location!: File[];
  public selectedImage = new ProductImage();

  imageEditForm = new FormGroup({
    name: new FormControl(),
    //location: new FormControl(),
  });

  
  dialogConfig = new MatDialogConfig();
  @ViewChild('editModal') editModal!: ElementRef;
  
  constructor(private imageService: ImageService, private formbuilder: FormBuilder, private http: HttpClient,
    private dialog: MatDialog, private fb: FormBuilder,
  ) 
  {this.refreshImageTable();}

  ngOnInit(): void {
    this.getImageList();
  }

  getImageList() {
    this.imageService.getImageList().subscribe(data => {
      this.productImages = data;
    });
  }


  onChange(event: any):void {
    const files: FileList = event.target.files;
    if (event.target.files) {
      const location  = event.target.files;
      const fileName = event.target.files.name;
      this.location = location;
      this.fileName =  fileName;
    }
  }

  public onAddNewImage(imageForm: NgForm): void {
    const formData = this.imageService.postUserData(imageForm.value, this.location);
    this.subscriptions.push(
      this.imageService.addImage(formData).subscribe(
        ((response: ProductImage) => {
          if (!!response) {
            console.log("Created Product image ");
          }
          this.getImageList();
        }),
      ));
  }

  public saveNewImage(): void {
    this.clickButton(`new-image-save`);
    this.refreshImageTable();
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }

  loadProductImages(event: PageEvent): PageEvent {
    this.page = event.pageIndex;
    this.size = event.pageSize;

    this.refreshImageTable(this.page, this.size);
    return event;
  }

  private refreshImageTable(page?: number, size?: number): void {
    this.productImages = [];
    // append page number and page size
    const suffix: string = (page !== undefined && size != undefined)
      ? "?page=" + page + "&size=" + size
      : "";

    this.http.get<PagedResponse<ProductImage>>(`${this.host}api/images/allImages` + suffix).subscribe((response: PagedResponse<ProductImage>) => {
      this.productImages = !!response.content ? response.content : [];
      this.totalCount = !!response.totalCount ? response.totalCount : 0;
    });
  }


  // edit(image: any) {
  //   this.imageToUpdate = image;
  // }

  opeEediModal(image: any){
    const modal = document.getElementById("editModal");
    if(modal !=null){
      modal.style.display="block";
    }
    this.imageToUpdate = image;
  }

  closeEditModal(){
    const modal = document.getElementById("editModal");
    if(modal !=null){
      modal.style.display="none";
    }
  }

  // updateImage() {
  //   this.imageService.updateImage(this.imageToUpdate).subscribe(
  //     (resp) => {
  //       console.log(resp);
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }

//   updateImage() {
//     if (!this.imageToUpdate || !this.imageToUpdate.id) { // Check for image and ID
//         console.error("Image or image ID is missing.");
//         return; // Or display an error message to the user
//     }

//     this.imageService.updateImage(this.imageToUpdate.id, this.imageToUpdate).subscribe({ // Pass id and image data
//         next: (resp) => {
//             console.log("Update successful:", resp);
//             // Handle success (e.g., refresh the image list, display a success message)
//         },
//         error: (err) => {
//             console.error("Update error:", err);
//             // Handle error (e.g., display an error message to the user)
//         }
//     });
// }

updateSelectedImage() {
  if (!this.imageToUpdate || !this.imageToUpdate.id) {
      console.error("Image or image ID is missing.");
      return;
  }

  const imageForUpdate: Partial<ProductImage> = {}; // Partial object

  if (this.imageEditForm.controls['name'].dirty) {
    
  console.log("Id being deleted is: " +imageForUpdate.id);
      imageForUpdate.name = this.imageToUpdate.name;
  }

  if (Object.keys(imageForUpdate).length === 0) {
      console.warn("No changes to update");
      return;
  }

  this.imageService.updateImagePartial(this.imageToUpdate.id, imageForUpdate).subscribe({ // Call the partial method
      next: (resp) => { console.log( "Update successful:", resp); },
      error: (err) => { console.error("Update error:", err);}
  });
}

delete(productImage: ProductImage) {
  const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
    data: { imageName: productImage.name }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.deleteImage(productImage.id!);
    }
  });
}

deleteImage(id: number) {
  if (!id) {
    console.error("Product image ID is missing.");
    return;
  }

  this.imageService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
    next: (response) => {
      console.log("Image deleted successfully:", response);
      this.refreshImageTable(); // Refresh the table
    },
    error: (error) => {
      console.error("Error deleting image:", error);
      // Handle error
    }
  });
}

}


