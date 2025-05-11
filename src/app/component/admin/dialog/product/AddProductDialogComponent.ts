import { Component, Inject, OnInit } from '@angular/core'; // Added OnDestroy
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductDto } from '../../../../model/dto/product-dto'; // Ensure this path is correct and DTO is updated
import { ProductService } from '../../../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ProductImage } from '../../../../model/ProductImage.model'; // Ensure this path is correct
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ProductCategoryService } from '../../../../services/product-category.service'; // Ensure this path is correct
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs'; // Import Observable and Subscription
import { ProductCategory } from '../../../../model/ProductCategory';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Added to imports array
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule,
    MatRadioModule,
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css'],
})
export class AddProductDialogComponent implements OnInit { // Implemented OnDestroy
  addProductForm: FormGroup;
  mainImage: File | null = null; // Note: File objects are typically handled outside the form group
  otherImages: File[] = []; // Note: File objects are typically handled outside the form group
  allProductImages: ProductImage[] = [];
  // isLoadingProductImages: boolean = false; // Removed as observable is passed
  totalProductImageCount: number = 0;
  currentProductImagePage: number = 1;
  productImagePageSize: number = 5; // Adjust as needed
  productImageFilterTerm: string = ''; // Redundant, using filterTerm below
  filterTerm: string = ''; // Use one consistent property for filter term
  productImageErrorMessage: string = '';
  selectedMainImageId: number | null = null;
  selectedOtherImageIds: number[] = [];
  allCategories: ProductCategory[] = [];
 // allCategories: ProductCategory[] = []; // Declare the categories array
  isLoadingCategories = false;
  categoryErrorMessage = '';
  currentPage: number = 0; // Current page for categories
  pageSize: number = 5;
  currentCategoryPage: number = 0; // Current page for categories (0-based for backend)
  categoryPageSize: number = 5;   // Page size for categories
  totalCategories: number = 0; // Total number of categories
  selectedCategoryId: number | null = null; // This property is updated by onCategorySelected

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService,
    private productCategoryService: ProductCategoryService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: {
      loadProductImages: (page: number, size: number, filter: string) => void,
      allProductImages: ProductImage[],
      isLoadingProductImages$: Observable<boolean>, // Observable for image loading state
      totalProductImageCount: number,
      currentProductImagePage: number,
      productImagePageSize: number,
      productImageFilterTerm: string,
      productImageErrorMessage: string,
    }
  ) {
    this.addProductForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      productType: ['NON_VEHICLE', Validators.required],
  vehicleType: [''],
  licensePlate: [''],
      mainImageId: [null], // To store the selected main image ID
      imageIds: [[]], // To store the selected other image IDs (array of IDs)
      categoryId: [null, Validators.required], // Category is required
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.loadProductImages) {
     this.data.loadProductImages(this.data.currentProductImagePage, this.data.productImagePageSize, this.data.productImageFilterTerm);
    this.allProductImages = this.data.allProductImages;
   // this.isLoadingProductImages = this.data.isLoadingProductImages; // Removed
    this.totalProductImageCount = this.data.totalProductImageCount;
    this.currentProductImagePage = this.data.currentProductImagePage;
    this.productImagePageSize = this.data.productImagePageSize;
    this.productImageFilterTerm = this.data.productImageFilterTerm;
     this.productImageErrorMessage = this.data.productImageErrorMessage;
    } else {
    console.warn('loadProductImages function not passed to the dialog.');
    }
    
     this.loadCategories();
     }
    
    onMainImageSelected(imageId: number): void {
     this.selectedMainImageId = imageId;
     this.addProductForm.patchValue({ mainImageId: imageId });
     }
    
     isMainImageSelected(imageId: number): boolean {
     return this.selectedMainImageId === imageId;
     }
    
     onOtherImageToggled(imageId: number): void {
        const index = this.selectedOtherImageIds.indexOf(imageId);
        if (index > -1) {
          this.selectedOtherImageIds.splice(index, 1);
        } else {
          this.selectedOtherImageIds.push(imageId);
        }
        this.addProductForm.patchValue({ imageIds: this.selectedOtherImageIds });
      }
    
      isOtherImageSelected(imageId: number): boolean {
        return this.selectedOtherImageIds.includes(imageId);
      }
    
      loadCategories(): void {
        this.isLoadingCategories = true;
        this.categoryErrorMessage = '';
    
        this.productCategoryService.getProductCategories(this.currentPage, this.pageSize).subscribe({ // Using observer object
          next: (response: any) => {
            this.allCategories = response.content;
            this.totalProductImageCount = response.totalElements;
            this.isLoadingCategories = false;
          },
          error: () => {
            this.snackBar.open('Error loading product categories:', 'Close', {duration: 3000});
            this.isLoadingCategories = false;
          },
          complete: () => {
            // Optional: Called when the observable completes (not common for HTTP requests)
            // console.log('Observable completed');
          }
        });
      }
    
      onCategorySelected(categoryId: number): void {
        this.selectedCategoryId = categoryId;
        this.addProductForm.patchValue({ categoryId: categoryId }); // Update the form control
      }
    
      handleCategoryPageEvent(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadCategories();
      }
    
      loadMoreProductImages(event?: PageEvent): void {
        if (this.data && this.data.loadProductImages) {
          const page = event ? event.pageIndex + 1 : this.currentProductImagePage + 1;
          const size = event ? event.pageSize : this.productImagePageSize;
    
          this.data.loadProductImages(page, size, this.productImageFilterTerm);
          this.currentProductImagePage = page;
          this.productImagePageSize = size;
          this.allProductImages = this.data.allProductImages;
        }
      }
    
      applyImageFilter(): void {
        if (this.data && this.data.loadProductImages) {
          this.currentProductImagePage = 1;
          this.data.loadProductImages(this.currentProductImagePage, this.productImagePageSize, this.productImageFilterTerm);
          this.allProductImages = this.data.allProductImages;
          // this.isLoadingProductImages = this.data.isLoadingProductImages; // Removed
        }
      }
    
      save(): void {
        if (this.addProductForm.valid && this.selectedMainImageId && this.addProductForm.get('categoryId')?.value) {
          const newProduct: ProductDto = {
            ...this.addProductForm.value,
            mainImageId: this.selectedMainImageId,
            imageIds: this.selectedOtherImageIds,
            categoryId: this.selectedCategoryId,
          };
          this.productService.createProduct(newProduct).subscribe({
            next: () => {
              this.snackBar.open('Product added successfully', 'Close', { duration: 3000 });
              this.dialogRef.close(true); // Indicate success
            },
            error: (error) => {
              this.snackBar.open('Error adding product', 'Close', { duration: 3000 });
              console.error('Error adding product:', error);
            },
          });
        } else {
          this.snackBar.open('Please fill all required fields and select a main image and category', 'Close', { duration: 5000 });
          console.error('Form is invalid or main image/category is not selected');
        }
      }
    
      onNoClick(): void {
        this.dialogRef.close(false);
  }
}
