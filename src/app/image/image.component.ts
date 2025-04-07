import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfirmDeleteDialogComponent } from '../component/dialog/confirm-delete-dialog-component/confirm-delete-dialog-component.component';
import { MessageResponse } from '../model/MessageResponse';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom

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
  private titleSubject = new BehaviorSubject<string>('Images');
  public titleAction$ = this.titleSubject.asObservable();

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  public term!: string;
  productImages: ProductImage[] = []
  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  page: number = 0;
  size: number = 4;
  public imageName!: string;
  public fileName!: string;
  public location!: File[];
  public productImage  = new ProductImage();


  dialogConfig = new MatDialogConfig();
  @ViewChild('editModal') editModal!: ElementRef;

  constructor(private imageService: ImageService, private http: HttpClient,
    private dialog: MatDialog, private fb: FormBuilder, private snackBar: MatSnackBar
  )
  {
    this.imageEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // No validation
    });
    this.loadImages();}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(event?: PageEvent) {
    if (event) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
    }

    this.imageService.getImageList(this.pageIndex, this.pageSize).subscribe(
        (response: any) => {
            this.productImages = response.content;
            this.totalCount = response.totalElements;
        },
        (error) => {
          this.snackBar.open('Error loading images:', 'Close',{duration: 3000,
          });
        }
    );
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

  public async onAddNewImage(imageForm: NgForm): Promise<void> {
    try {
      const formData = this.imageService.postUserData(imageForm.value, this.location); // Assuming 'this.location' contains the files

      const response: MessageResponse = await firstValueFrom(this.imageService.addImage(formData));

      this.snackBar.open(response.message, 'Close', { duration: 3000 });
      this.loadImages();
      imageForm.resetForm();
    } catch (error) {
      let errorMessage = "An error occurred.";

      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      } else {
        errorMessage = "A network or unexpected error occurred";
        console.error("An unexpected error has occurred:", error);
      }

      this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      console.error("Image upload failed:", error);
    }
  }

  public onAddNewImage1(imageForm: NgForm): void {
    const formData = this.imageService.postUserData(imageForm.value, this.location);
    this.imageService.addImage(formData).subscribe({
      next: (response: MessageResponse) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        console.log('Image operation successful:', response.message);
        this.loadImages();
        imageForm.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred.';

        if (error.error instanceof Object && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      },
    });
  }

  openEditModal(image: ProductImage) {
    const index = this.productImages.findIndex(img => img.id === image.id);
    if (index > -1) {
      this.selectedImage = this.productImages[index]; // Direct reference!

      this.imageEditForm.patchValue({
        name: this.selectedImage.name,
        location: this.selectedImage.location,
      });

      // Subscribe to value changes for live updates
      this.imageEditForm.get('name')?.valueChanges.subscribe(value => {
        if (this.selectedImage) {
          this.selectedImage.name = value;
        }
      });

      const modal = document.getElementById('editModal');
      if (modal != null) {
        modal.style.display = 'block';
      }
    } else {
      this.snackBar.open('Image not found in productImages array.', 'Close',{duration: 3000,
      });
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
    this.snackBar.open('Image or image ID is missing.', 'Close',{duration: 3000,
    });
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
      );

      this.productImages[index] = updatedImage; // Update the array with the new object
    }

    this.imageService.updateImagePartial(this.selectedImage.id, this.imageEditForm.value).subscribe({
      next: (resp) => {
        this.snackBar.open(`${resp.message}`, 'Close',{duration: 3000,
        });
        this.closeEditModal();
        this.loadImages(); // Refresh the image list
      },
      error: (err) => {
        this.snackBar.open(`${err.message}`, 'Close', {
          duration: 3000,
      });
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

  this.imageService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
    next: (response) => {
      this.snackBar.open('Image deleted successfully', 'Close',{duration: 3000,
      });
      this.loadImages();
    },
    error: (error) => {
      this.snackBar.open('Error deleting image:', 'Close',{duration: 3000,
      });
    }
  });
}

}


