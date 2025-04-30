import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductDto } from '../../../../model/dto/product-dto';
import { ProductService } from '../../../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../../services/image.service';
import { ProductImage } from '../../../../model/ProductImage.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css'],
})
export class AddProductDialogComponent implements OnInit {
  addProductForm: FormGroup;
  mainImage: File | null = null;
  otherImages: File[] = [];
  allProductImages: ProductImage[] = [];
  isLoadingProductImages: boolean = false;
  totalProductImageCount: number = 0;
  currentProductImagePage: number = 1;
  productImagePageSize: number = 5; // Adjust as needed
  productImageFilterTerm: string = '';
  productImageErrorMessage: string = '';
  selectedMainImageId: number | null = null;
  selectedOtherImageIds: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService,
    private imageService: ImageService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: {
      loadProductImages: (page: number, size: number, filter: string) => void,
      allProductImages: ProductImage[],
      isLoadingProductImages: boolean,
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
      licensePlate: [''],
      itemType: [''],
      make: [''],
      model: [''],
      serialNumber: [''],
      notes: [''],
      department: [''],
      mainImageId: [null], // To store the selected main image ID
      imageIds: [[]],     // To store the selected other image IDs
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.loadProductImages) {
      this.data.loadProductImages(this.data.currentProductImagePage, this.data.productImagePageSize, this.data.productImageFilterTerm);
      this.allProductImages = this.data.allProductImages;
      this.isLoadingProductImages = this.data.isLoadingProductImages;
      this.totalProductImageCount = this.data.totalProductImageCount;
      this.currentProductImagePage = this.data.currentProductImagePage;
      this.productImagePageSize = this.data.productImagePageSize;
      this.productImageFilterTerm = this.data.productImageFilterTerm;
      this.productImageErrorMessage = this.data.productImageErrorMessage;
    } else {
      console.warn('loadProductImages function not passed to the dialog.');
    }
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

  loadMoreProductImages(): void {
    if (this.data && this.data.loadProductImages && (this.allProductImages.length < this.totalProductImageCount)) {
      this.data.loadProductImages(this.currentProductImagePage + 1, this.productImagePageSize, this.productImageFilterTerm);
      this.currentProductImagePage++;
      this.allProductImages = this.data.allProductImages;
      this.isLoadingProductImages = this.data.isLoadingProductImages;
    }
  }

  applyImageFilter(): void {
    if (this.data && this.data.loadProductImages) {
      this.currentProductImagePage = 1;
      this.data.loadProductImages(this.currentProductImagePage, this.productImagePageSize, this.productImageFilterTerm);
      this.allProductImages = this.data.allProductImages;
      this.isLoadingProductImages = this.data.isLoadingProductImages;
    }
  }

  save(): void {
    if (this.addProductForm.valid) {
      const newProduct: ProductDto = this.addProductForm.value;
      this.productService.createProduct(newProduct).subscribe({
        next: (response) => {
          this.snackBar.open('Product added successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true); // Indicate success
        },
        error: (error) => {
          this.snackBar.open('Error adding product', 'Close', { duration: 3000 });
          console.error('Error adding product:', error);
        },
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}