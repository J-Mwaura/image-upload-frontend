import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {NgForm,
  FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductImage } from '../../model/ProductImage';
import { ImageService } from '../../service/image.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfirmDeleteDialogComponent } from '../../dialog/confirm-delete-dialog-component/confirm-delete-dialog-component.component';
import { MessageResponse } from '../../model/MessageResponse';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-image',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatButtonModule, ConfirmDeleteDialogComponent],
  standalone: true,

  templateUrl: './image.component.html',
  styleUrl: `./image.component.css`
})

export class ImageComponent implements OnInit {
  isIpad = false;
  selectedImage: ProductImage | null = null;
  imageEditForm: FormGroup;
  displayedColumns: string[] = ['name', 'url', 'delete', 'edit'];
  private titleSubject = new BehaviorSubject<string>('Images');
  public titleAction$ = this.titleSubject.asObservable();

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
  public url!: File[];
  public productImage: ProductImage | undefined;


  dialogConfig = new MatDialogConfig();
  @ViewChild('editModal') editModal!: ElementRef;

  constructor(private imageService: ImageService, 
    private dialog: MatDialog, private fb: FormBuilder, private snackBar: MatSnackBar
  )
  {
    this.imageEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // No validation
    });
    this.loadImages();
  }

  ngOnInit(): void {
    this.loadImages();
}

loadImages(event?: PageEvent) {
  if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
  }

  this.imageService.getImages(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
          this.productImages = response.content;
          this.totalCount = response.totalElements;
      },
      error: () => {
          this.snackBar.open('Error loading images:', 'Close', { duration: 3000 });
      },
  });
}

  onChange(event: any):void {
    if (event.target.files) {
      const url  = event.target.files;
      const fileName = event.target.files.name;
      this.url = url;
      this.fileName =  fileName;
    }
  }

  public async onAddNewImage(imageForm: NgForm): Promise<void> {
    try {
      const formData = this.imageService.postUserData(imageForm.value, this.url); 

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

  openEditModal(image: ProductImage) {
    const index = this.productImages.findIndex(img => img.id === image.id);
    if (index > -1) {
      this.selectedImage = this.productImages[index];

      this.imageEditForm.patchValue({
        name: this.selectedImage.name,
        url: this.selectedImage.url,
      });

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
  this.selectedImage = null; 

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
      const updatedImage: ProductImage = {
        id: this.selectedImage.id,
        name: this.imageEditForm.value.name,
        url: this.imageEditForm.value.url,
      };

      this.productImages[index] = updatedImage; 
    }

    this.imageService.updateImagePartial(this.selectedImage.id, this.imageEditForm.value).subscribe({
      next: (resp) => {
        this.snackBar.open(`${resp.message}`, 'Close',{duration: 3000,
        });
        this.closeEditModal();
        this.loadImages();
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
    next: () => {
      this.snackBar.open('Image deleted successfully', 'Close',{duration: 3000,
      });
      this.loadImages();
    },
    error: () => {
      this.snackBar.open('Error deleting image:', 'Close',{duration: 3000,
      });
    }
  });
}

}


