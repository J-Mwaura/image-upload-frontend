import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { ProductCategory } from '../../../model/ProductCategory';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ProductCategoryService} from '../../../services/product-category.service';
import { UpdateProductCategoryDTO } from '../../../model/update-product-category-dto.model';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';

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
    MatCheckbox,
  ],
})
export class ProductCategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false; // Flag to track if we are editing

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductCategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductCategory,
    private productCategoryService: ProductCategoryService,
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
              this.snackBar.open(`Category "${response.data?.name}" updated successfully.`, 'Close', { duration: 3000 });
              this.dialogRef.close(response.data);
            } else {
              this.errorMessage = `Error updating category: ${response.message}`;
              this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
            }
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'An unexpected error occurred during update.';
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
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
              this.snackBar.open(`Category "${response.data?.name}" saved successfully.`, 'Close', { duration: 3000 });
              this.dialogRef.close(response.data);
            } else {
              this.errorMessage = `Error saving category: ${response.message}`;
              this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
            }
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'An unexpected error occurred during save.';
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
            console.error('Error saving product category:', error);
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill out the required fields.';
    }
  }

  onRemoveImage(): void {
    this.categoryForm.patchValue({ imageId: null, removeImage: true });
  }
}
