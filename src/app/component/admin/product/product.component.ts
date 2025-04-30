import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ProductDto } from '../../../model/dto/product-dto';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddProductDialogComponent } from './../dialog/product/AddProductDialogComponent';
import { EditProductDialogComponent } from './../dialog/product/EditProductDialogComponent';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { catchError, forkJoin, of, take } from 'rxjs';
import { ImageService } from '../../../services/image.service'; // Import ImageService
import { ApiResponse } from '../../../model/ApiResponse'; // Assuming you have this
import { Page } from '../../../model/page'; // Assuming you have this
import { ProductImage } from '../../../model/ProductImage.model'; // Assuming you have this

@Component({
  selector: 'app-admin-product-list', // Renamed selector
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatIconButton, MatProgressSpinnerModule, MatButton],
})
export class AdminProductComponent implements OnInit {
  loading = true;
  errorMessage = '';
  products: ProductDto[] = [];
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;
  displayedColumns: string[] = ['id', 'image', 'name', 'price', 'actions']; // For MatTable

  mainImageUrls: { [productId: number]: string | undefined } = {};
  additionalImageUrls: { [productId: number]: string[] | undefined } = {};

  // Properties for loading product images for selection (in add/edit dialogs)
  allProductImagesForSelection: ProductImage[] = [];
  isLoadingProductImages: boolean = false;
  totalProductImageCount: number = 0;
  currentProductImagePage: number = 1;
  productImagePageSize: number = 10;
  productImageFilterTerm: string = '';
  productImageErrorMessage: string = '';

  constructor(
    private productService: ProductService,
    private imageService: ImageService, // Inject ImageService
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(event?: PageEvent): void {
    this.loading = true;
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  
    this.productService.getAllProducts(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.totalCount = response.totalElements;
  
        this.products.forEach(product => {
          this.mainImageUrls[product.id!] = product.mainImageUrl ?? undefined;
          this.additionalImageUrls[product.id!] = product.otherImageUrls ?? undefined;
        });
  
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading products';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  loadProductImages(product: ProductDto): void {
    // Guard: Skip if product.id is null/undefined
    if (product.id == null) return;  // Covers both `null` and `undefined`

    // Reset images (safe, since we checked product.id)
    this.mainImageUrls[product.id] = undefined;
    this.additionalImageUrls[product.id] = undefined;

    // Load main image
    if (product.mainImageId) {
      this.productService.getImageUrl(product.mainImageId).pipe(
        take(1),
        catchError(() => of(undefined))
      ).subscribe(url => {
        this.mainImageUrls[product.id!] = url;  // `!` asserts non-null (safe due to guard)
      });
    }

    // Load additional images
    if (product.imageIds?.length) {
      forkJoin(
        product.imageIds.map(id =>
          this.productService.getImageUrl(id).pipe(
            catchError(() => of(undefined))
          )
        )
      ).pipe(take(1)).subscribe(urls => {
        this.additionalImageUrls[product.id!] = urls.filter(Boolean) as string[];
      });
    }
  }

  handlePageEvent(event: PageEvent): void {
    this.getProducts(event);
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '600px', // Adjust width as needed
      data: {
        loadProductImages: this.loadProductImagesForSelection.bind(this),
        allProductImages: this.allProductImagesForSelection,
        isLoadingProductImages: this.isLoadingProductImages,
        totalProductImageCount: this.totalProductImageCount,
        currentProductImagePage: this.currentProductImagePage,
        productImagePageSize: this.productImagePageSize,
        productImageFilterTerm: this.productImageFilterTerm,
        productImageErrorMessage: this.productImageErrorMessage,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProducts(); // Refresh the product list after successful add
      }
    });
  }

  editProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          const dialogRef = this.dialog.open(EditProductDialogComponent, {
            width: '600px', // Adjust width as needed
            data: {
              ...product,
              loadProductImages: this.loadProductImagesForSelection.bind(this),
              allProductImages: this.allProductImagesForSelection,
              isLoadingProductImages: this.isLoadingProductImages,
              totalProductImageCount: this.totalProductImageCount,
              currentProductImagePage: this.currentProductImagePage,
              productImagePageSize: this.productImagePageSize,
              productImageFilterTerm: this.productImageFilterTerm,
              productImageErrorMessage: this.productImageErrorMessage,
            },
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.getProducts(); // Refresh the product list after successful edit
            }
          });
        } else {
          this.snackBar.open('Product not found', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.snackBar.open('Error fetching product details', 'Close', { duration: 3000 });
        console.error('Error fetching product:', error);
      },
    });
  }

  viewProduct(id: number): void {
    this.router.navigate(['/admin/products/view', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.getProducts(); // Refresh the product list
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Error deleting product';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          console.error('Error deleting product:', error);
        },
      });
    }
  }

  loadProductImagesForSelection(page: number = this.currentProductImagePage, size: number = this.productImagePageSize, filter: string = this.productImageFilterTerm): void {
    this.isLoadingProductImages = true;
    this.imageService.getImagesByEntityType('PRODUCT', page, size, filter).subscribe({
      next: (response: ApiResponse<Page<ProductImage> | null>) => {
        this.isLoadingProductImages = false;
        if (response.success && response.data && response.data['page']) { // Check if 'page' exists
          this.allProductImagesForSelection = response.data.content;
          this.totalProductImageCount = response.data['page'].totalElements; // Access totalElements under 'page'
          this.currentProductImagePage = response.data['page'].number + 1;
          this.productImagePageSize = response.data['page'].size;
          console.log('totalProductImageCount:', this.totalProductImageCount);
        } else {
          this.allProductImagesForSelection = [];
          this.totalProductImageCount = 0;
          this.productImageErrorMessage = response ? response.message : 'Failed to load product images for selection.';
          console.error('Error fetching product images for selection:', response);
        }
      },
      error: (error) => {
        this.isLoadingProductImages = false;
        this.allProductImagesForSelection = [];
        this.totalProductImageCount = 0;
        this.productImageErrorMessage = 'Error fetching product images for selection.';
        console.error('Error fetching product images for selection:', error);
      }
    });
  }

  onProductImagePageChange(event: PageEvent): void {
    this.currentProductImagePage = event.pageIndex + 1;
    this.productImagePageSize = event.pageSize;
    this.loadProductImagesForSelection();
  }

  filterProductImages(): void {
    this.currentProductImagePage = 1;
    this.loadProductImagesForSelection();
  }
}