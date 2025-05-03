import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ProductDto } from '../../../model/dto/product-dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion'; 

@Component({
  selector: 'app-user-product-list',
  templateUrl: './user-product.component.html',
  styleUrls: ['./user-product.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    NgOptimizedImage,
    CurrencyPipe, 
    MatTableModule,
    MatExpansionModule,
  ],
})
export class UserProductComponent implements OnInit {
  loading = true;
  errorMessage = '';
  products: ProductDto[] = [];
  totalCount = 0;
  pageSize = 8; // Initial page size
  pageIndex = 0;
  mainImageUrls: { [productId: number]: string | undefined } = {};
  expandedProductId: number | null = null;
  
  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
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

  handlePageEvent(event: PageEvent): void {
    this.getProducts(event);
  }
}