import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ProductCategory} from '../../../model/ProductCategory';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ProductCategoryService} from '../../../services/product-category.service';
import {UpdateProductCategoryDTO} from '../../../model/update-product-category-dto.model';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ProductImage} from '../../../model/ProductImage.model';
import {ImageService} from '../../../services/image.service';
import {ApiResponse} from '../../../model/ApiResponse';
import {MatRadioButton} from '@angular/material/radio';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Page} from '../../../model/page';

@Component({
  selector: 'app-product-category-form',
  standalone: true,
  templateUrl: './product-category-form.component.html',
  styleUrls: ['./product-category-form.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioButton,
    MatPaginator,
    NgOptimizedImage,
  ],
})
export class ProductCategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  allCategoryImages: ProductImage[] = [];
  totalImageCount: number = 0;
  pageSize: number = 5;
  currentPage: number = 1;
  filterTerm: string = '';
  loading = false;
  errorMessage = '';
  isEditMode = false; // Flag to track if we are editing
  isLoadingImages: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductCategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductCategory,
    private productCategoryService: ProductCategoryService,
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      imageId: [null],
      removeImage: [false] // Add a control for removing the image
    });
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.isEditMode = true;
      this.categoryForm.patchValue({
        name: this.data.name,
        imageId: this.data.imageId
      });
    }
    this.loadCategoryImages();

  }

  loadCategoryImages(page: number = this.currentPage, size: number = this.pageSize, filter: string = this.filterTerm): void {
    this.isLoadingImages = true;
    this.imageService.getImagesByEntityType('category', page, size, filter).subscribe({
      next: (response: ApiResponse<Page<ProductImage> | null>) => {
        this.isLoadingImages = false;
        if (response.success && response.data && response.data['page']) { // Check if 'page' exists
          this.allCategoryImages = response.data.content;
          this.totalImageCount = response.data['page'].totalElements; // Access totalElements under 'page'
          this.currentPage = response.data['page'].number + 1;
          this.pageSize = response.data['page'].size;
          console.log('totalImageCount:', this.totalImageCount);
        } else {
          this.allCategoryImages = [];
          this.totalImageCount = 0;
          this.errorMessage = response ? response.message : 'Failed to load images.';
          console.error('Error fetching category images:', response);
        }
      },
      error: (error) => {
        this.isLoadingImages = false;
        this.allCategoryImages = [];
        this.totalImageCount = 0;
        console.error('Error fetching category images:', error);
      }
    });
  }

  onFilterInputChange(): void {
    console.log('Filter term changed:', this.filterTerm);
    console.log('this.filterTerm:', this.filterTerm); // Add this line
    // Reset to the first page when the filter changes
    this.currentPage = 1;
    this.loadCategoryImages(this.currentPage, this.pageSize, this.filterTerm);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCategoryImages();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const formData = this.categoryForm.value;

      if (this.isEditMode && this.data?.id) {
        const updatePayload: UpdateProductCategoryDTO = {};
        if (formData.name !== this.data.name) {
          updatePayload.name = formData.name;
        }
        if (formData.imageId !== this.data.imageId) {
          updatePayload.imageId = formData.imageId;
        }
        if (formData.removeImage) {
          updatePayload.removeImage = true;
        }

        this.productCategoryService.updateProductCategory(this.data.id, updatePayload).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.success) {
              this.snackBar.open(`Category "${response.data?.name}" updated successfully.`, 'Close', {duration: 3000});
              this.dialogRef.close(response.data);
            } else {
              this.errorMessage = `Error updating category: ${response.message}`;
              this.snackBar.open(this.errorMessage, 'Close', {duration: 5000});
            }
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'An unexpected error occurred during update.';
            this.snackBar.open(this.errorMessage, 'Close', {duration: 5000});
            console.error('Error updating product category:', error);
          }
        });
      } else {
        // Create new category
        const categoryToSave: ProductCategory = {
          id: null,
          name: formData.name,
          imageId: formData.imageId
        };
        this.productCategoryService.saveProductCategory(categoryToSave).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.success) {
              this.snackBar.open(`Category "${response.data?.name}" saved successfully.`, 'Close', {duration: 3000});
              this.dialogRef.close(response.data);
            } else {
              this.errorMessage = `Error saving category: ${response.message}`;
              this.snackBar.open(this.errorMessage, 'Close', {duration: 5000});
            }
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'An unexpected error occurred during save.';
            this.snackBar.open(this.errorMessage, 'Close', {duration: 5000});
            console.error('Error saving product category:', error);
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill out the required fields.';
    }
  }

  onRemoveImage(): void {
    this.categoryForm.patchValue({imageId: null, removeImage: true});
  }
}
