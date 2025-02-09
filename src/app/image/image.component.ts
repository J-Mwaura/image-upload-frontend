import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {NgForm,
  FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductImage } from '../model/ProductImage.model';
import { ImageService } from '../services/image.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
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

@Component({
  selector: 'app-image',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule, 
    MatFormFieldModule, MatInputModule, MatDialogModule, ConfirmDeleteDialogComponent],
  standalone: true,

  templateUrl: './image.component.html',
  styleUrl: `./image.component.css`
})

export class ImageComponent implements OnInit {
  selectedImage: ProductImage | null = null;
  imageEditForm: FormGroup; 
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
  //productImages: ProductImage[] = [];
  public imageName!: string;
  public fileName!: string;
  public location!: File[];
  public productImage  = new ProductImage();


  dialogConfig = new MatDialogConfig();
  @ViewChild('editModal') editModal!: ElementRef;
  
  constructor(private imageService: ImageService, private http: HttpClient,
    private dialog: MatDialog, private fb: FormBuilder, 
  ) 
  {
    this.imageEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // No validation
    });
    this.refreshImageTable();}

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

  openEditModal(image: ProductImage) {
    const index = this.productImages.findIndex(img => img.id === image.id);
    if (index > -1) {
      this.selectedImage = this.productImages[index]; // Direct reference!

      this.imageEditForm.patchValue({
        name: this.selectedImage.name,
        location: this.selectedImage.location,
        // ... patch other form controls
      });

      // Subscribe to value changes for live updates
      this.imageEditForm.get('name')?.valueChanges.subscribe(value => {
        if (this.selectedImage) {
          this.selectedImage.name = value; // Update selectedImage directly
        }
      });

      const modal = document.getElementById('editModal');
      if (modal != null) {
        modal.style.display = 'block';
      }
    } else {
      console.error("Image not found in productImages array.");
    }
  }

closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal != null) {
    modal.style.display = 'none';
  }
  this.imageEditForm.reset();
  this.selectedImage = null; // Reset selectedImage

}

updateSelectedImage() {
  if (!this.selectedImage || !this.selectedImage.id) {
    console.error('Image or image ID is missing.');
    return;
  }

  if (this.imageEditForm.valid) {
    const index = this.productImages.findIndex(img => img.id === this.selectedImage!.id);
    if (index > -1) {
      // Create a *new* ProductImage object with the updated values
      const updatedImage = new ProductImage(
        this.selectedImage.id,
        this.imageEditForm.value.name,
        this.imageEditForm.value.location
        // ... other updated properties
      );

      this.productImages[index] = updatedImage; // Update the array with the new object
    }

    this.imageService.updateImagePartial(this.selectedImage.id, this.imageEditForm.value).subscribe({
      next: (resp) => {
        console.log('Update successful:', resp);
        this.closeEditModal();
        this.getImageList(); // Refresh the image list
      },
      error: (err) => {
        console.error('Update error:', err);
      },
    });
  }
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
      //this.refreshImageTable(); // Refresh the table
      this.getImageList();
    },
    error: (error) => {
      console.error("Error deleting image:", error);
      // Handle error
    }
  });
}

loadProductImages(event: PageEvent): PageEvent {
  this.page = event.pageIndex;
  this.size = event.pageSize;

  this.refreshImageTable(this.page, this.size);
  return event;
}

}


