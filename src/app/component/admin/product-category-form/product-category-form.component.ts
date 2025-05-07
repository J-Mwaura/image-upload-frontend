import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ProductCategory} from '../../../model/ProductCategory';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ProductCategoryService} from '../../../services/product-category.service';
import {UpdateProductCategoryDTO} from '../../../model/dto/update-product-category-dto.model';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ProductImage} from '../../../model/ProductImage.model';
import {ImageService} from '../../../services/image.service';
import {ApiResponse} from '../../../model/response/ApiResponse';
import {MatRadioButton} from '@angular/material/radio';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Page} from '../../../model/page';
import { ProductCategoryDTO } from '../../../model/dto/product-category-dto';

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
    @Inject(MAT_DIALOG_DATA) public data: ProductCategory, // Data passed to the dialog (ProductCategory for editing)
    private productCategoryService: ProductCategoryService,
    private imageService: ImageService, // Assuming you have an ImageService to fetch images
    private snackBar: MatSnackBar
  ) {
    // Initialize the form group with controls for name, imageId, and removeImage
    this.categoryForm = this.fb.group({
      name: ['', Validators.required], // Category name is required
      imageId: [null], // To hold the selected image ID
      removeImage: [false] // Checkbox to indicate if the existing image should be removed
    });
  }

  ngOnInit(): void {
    // If data is provided, we are in edit mode
    if (this.data?.id) {
      this.isEditMode = true;
      // Patch the form with existing category data
      this.categoryForm.patchValue({
        name: this.data.name,
        imageId: this.data.imageId // Set the existing imageId
      });
    }
    // Load available category images when the dialog opens
    this.loadCategoryImages();
  }

  /**
   * Loads category images from the backend with pagination and filtering.
   * @param page The page number to load (1-based).
   * @param size The number of items per page.
   * @param filter The filter term for image names/metadata.
   */
  loadCategoryImages(page: number = this.currentPage, size: number = this.pageSize, filter: string = this.filterTerm): void {
    this.isLoadingImages = true;
    // Call the image service to get images filtered by entity type 'CATEGORY'
    this.imageService.getImagesByEntityType('CATEGORY', page, size, filter).subscribe({
      next: (response: ApiResponse<Page<ProductImage> | null>) => {
        this.isLoadingImages = false;
        // Check if the response is successful and contains data and pagination info
        if (response.success && response.data && response.data['page']) {
          this.allCategoryImages = response.data.content; // Extract image content
          this.totalImageCount = response.data['page'].totalElements; // Get total number of images
          this.currentPage = response.data['page'].number + 1; // Update current page (Spring Data Page is 0-based)
          this.pageSize = response.data['page'].size; // Update page size
          console.log('totalImageCount:', this.totalImageCount);
        } else {
          // Handle cases where no images are returned or response is not successful
          this.allCategoryImages = [];
          this.totalImageCount = 0;
          this.errorMessage = response ? response.message : 'Failed to load images.';
          console.error('Error fetching category images:', response);
        }
      },
      error: (error) => {
        // Handle HTTP errors during image fetching
        this.isLoadingImages = false;
        this.allCategoryImages = [];
        this.totalImageCount = 0;
        console.error('Error fetching category images:', error);
        this.snackBar.open('Error loading images. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Handles input changes in the filter term for images.
   * Resets to the first page and reloads images with the new filter.
   * @param event The input event.
   */
  onFilterInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    console.log('Filter term changed:', value);
    this.currentPage = 1; // Reset to first page on filter change
    this.loadCategoryImages(this.currentPage, this.pageSize, value);
    this.filterTerm = value; // Store the current filter term
  }


  /**
   * Handles page changes in the image paginator.
   * Loads images for the selected page and size.
   * @param event The PageEvent from the paginator.
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // MatPaginator is 0-based, convert to 1-based for backend
    this.pageSize = event.pageSize;
    this.loadCategoryImages(); // Load images for the new page and size
  }

  /**
   * Closes the dialog without saving changes.
   */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /**
   * Handles the form submission for saving or updating a category.
   */
  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const formData = this.categoryForm.value; // Get current form values

      if (this.isEditMode && this.data?.id) {
        // Logic for updating an existing category
        const updatePayload: UpdateProductCategoryDTO = {};

        // Include name in payload only if it has changed
        if (formData.name !== this.data.name) {
          updatePayload.name = formData.name;
        }

        // Determine if imageId needs to be updated
        const currentImageId = this.data.imageId; // Original image ID
        const newImageId = formData.imageId; // Newly selected image ID from the form
        const removeImageFlag = formData.removeImage; // Value of the 'removeImage' checkbox

        if (removeImageFlag) {
            // If 'removeImage' is checked, set imageId to null in the payload
            updatePayload.imageId = null;
        } else if (newImageId !== currentImageId) {
            // If 'removeImage' is NOT checked and a new image is selected (or selection changed)
            // Include the new imageId in the payload. This handles selecting a new image
            // or unselecting a previously selected image (setting newImageId to null).
            updatePayload.imageId = newImageId;
        }
        // Note: If removeImage is false AND newImageId is the same as currentImageId,
        // imageId is not included in the payload, meaning it won't be changed on the backend.

        // Call the service to update the category with the constructed payload
        this.productCategoryService.updateProductCategory(this.data.id, updatePayload).subscribe({
          next: (response) => {
            this.handleSuccessResponse(response, 'updated');
          },
          error: (error) => {
            this.handleError(error, 'update');
          }
        });
      } else {
        // Logic for creating a new category
        const categoryToSave: ProductCategoryDTO = {
          id: null, // ID should be null for creation
          name: formData.name, // Get name from form
          imageId: formData.imageId // Get selected imageId from form
        };

        // Call the service to save the new category
        this.productCategoryService.saveProductCategory(categoryToSave).subscribe({
          next: (response) => {
            this.handleSuccessResponse(response, 'saved');
          },
          error: (error) => {
            this.handleError(error, 'save');
          }
        });
      }
    } else {
      // If the form is invalid, display an error message
      this.errorMessage = 'Please fill out the required fields.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    }
  }

  // Helper method for handling successful API responses
  private handleSuccessResponse(response: ApiResponse<ProductCategoryDTO>, action: string): void {
    this.loading = false;
    if (response.success) {
      const message = `Category "${response.data?.name}" ${action} successfully.`;
      this.snackBar.open(message, 'Close', { duration: 3000 });
      // Close the dialog and pass the saved/updated category data back
      this.dialogRef.close(response.data);
    } else {
      // Handle unsuccessful API response with a message
      this.errorMessage = `Error ${action}ing category: ${response.message}`;
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    }
  }

  // Helper method for handling API error responses
  private handleError(error: any, action: string): void {
    this.loading = false;
    let userFriendlyMessage = 'An unexpected error occurred.';

    // Handle specific error cases, like duplicate key violation (e.g., image already assigned)
    if (error.status === 409) {
      userFriendlyMessage = 'This image is already assigned to another category. Please choose a different image.';
    }
    // Handle other API errors with messages from the backend
    else if (error.error?.message) {
      userFriendlyMessage = error.error.message;
    }
    // Handle generic HTTP errors
    else if (error.status) {
      userFriendlyMessage = `Server error (${error.status}): Please try again later.`;
    }

    this.errorMessage = `Failed to ${action} category: ${userFriendlyMessage}`;
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    console.error(`Error ${action}ing category:`, error);
  }

  /**
   * Clears the selected image ID and sets the removeImage flag.
   * This is typically triggered by a "Remove Image" button/checkbox.
   */
  onRemoveImage(): void {
    this.categoryForm.patchValue({imageId: null, removeImage: true});
  }

  /**
   * Checks if a given image ID is currently selected in the form.
   * Used to highlight the selected image in the UI.
   * @param imageId The ID of the image to check.
   * @returns True if the image is selected, false otherwise.
   */
  isSelectedImage(imageId: number | null | undefined): boolean {
     return this.categoryForm.get('imageId')?.value === imageId;
  }

  /**
   * Sets the selected image ID in the form.
   * Triggered when a user clicks on an image in the list.
   * Also clears the removeImage flag as an image is now selected.
   * @param imageId The ID of the image that was selected.
   */
  selectImage(imageId: number | null): void {
    this.categoryForm.patchValue({ imageId: imageId, removeImage: false });
  }
}
