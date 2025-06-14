import {CommonModule, NgOptimizedImage} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {NgForm,
  FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductImage } from '../../../model/ProductImage.model';
import { ImageService } from '../../../services/image.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfirmDeleteDialogComponent } from '../../dialog/confirm-delete-dialog-component/confirm-delete-dialog-component.component';
import { MessageResponse } from '../../../model/response/MessageResponse';
import { firstValueFrom } from 'rxjs';
import {MatButton, MatIconButton} from '@angular/material/button';
import { ApiResponse } from '../../../model/response/ApiResponse';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-image',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, NgOptimizedImage, MatIconButton, MatButton],
  standalone: true,

  templateUrl: './image.component.html',
  styleUrl: `./image.component.css`
})

export class ImageComponent implements OnInit {
  productImage: ProductImage = new ProductImage();
  selectedImage: ProductImage | null = null;
  imageEditForm: FormGroup;
  displayedColumns: string[] = ['name', 'url', 'id', 'action', 'edit'];
  productImages: ProductImage[] = []
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 5;
  page: number = 0;
  size: number = 4;
  public fileName!: string;
  public url!: File[];
  isLoading = false;

  @ViewChild('editModal') editModal!: ElementRef;

  constructor(private imageService: ImageService,
    private dialog: MatDialog, private fb: FormBuilder, private snackBar: SnackbarService
  )
  {
    this.imageEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // No validation
    });
    this.loadImages();}

  ngOnInit(): void {
    this.loadImages();
  }
  

  loadImages(event?: PageEvent): void {
    // Update pagination if event exists
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  
    this.isLoading = true;
  
    this.imageService.getImageList(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        this.productImages = response.content;
        this.totalCount = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.error('Error loading images: ' + (error.error?.message || ''));
        this.isLoading = false;
        console.error('Image load error:', error);
      }
    });
  }

  onChange(event: any): void {
    const files: FileList = event.target.files;
    if (event.target.files) {
      const url = event.target.files;
      const fileName = event.target.files.name;
      this.url = url;
      this.fileName = fileName;
    }
  }

  public async onAddNewImage(imageForm: NgForm): Promise<void> {
    try {
      const formData = this.imageService.postUserData(
        this.productImage,
        this.url,
        this.productImage.entityType
      );

      const response: MessageResponse = await firstValueFrom(this.imageService.addImage(formData));

      this.snackBar.success(response.message);
      this.loadImages();
      imageForm.resetForm();
      this.url = [];
      this.productImage = new ProductImage();
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

      this.snackBar.error(errorMessage);
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
      this.snackBar.error('Image not found in productImages array.');
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
      this.snackBar.error('Image or image ID is missing.');
      return;
    }

    if (this.imageEditForm.valid) {
      const index = this.productImages.findIndex(img => img.id === this.selectedImage!.id);
      if (index > -1) {
        const updatedImage = new ProductImage(
          this.selectedImage.id,
          this.imageEditForm.value.name,
          this.imageEditForm.value.url
        );

        this.productImages[index] = updatedImage;
      }

      this.imageService.updateImagePartial(this.selectedImage.id, this.imageEditForm.value).subscribe({
        next: (resp: ApiResponse<ProductImage>) => { 
          this.snackBar.success(`${resp.data?.name || 'Image'} ${resp.message}`);
          this.closeEditModal();
          this.loadImages(); 
        },
        error: (err: { message: string }) => { 
          this.snackBar.error(`${err.message}`);
        }
      });
    }
  }

  delete(productImage: ProductImage) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { itemName: productImage.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDeleteImage(productImage.id!);
      }
    });
  }

  onDeleteImage(id: number): void {
    this.imageService.deleteImage(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.success(response.message);
          this.loadImages();
        } else {
          this.snackBar.error(response.message);
        }
      },
      error: (error) => {
        this.snackBar.error('An unexpected error occurred');
      }
    });
  }
}