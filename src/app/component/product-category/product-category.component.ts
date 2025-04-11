import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ProductCategoryService} from '../../services/product-category.service';
import {ProductCategory} from '../../model/ProductCategory';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  MatCardModule,
} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CommonModule, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-product-category',
  imports: [
    CommonModule, NgOptimizedImage, MatCardModule, MatProgressSpinner, MatPaginator,
  ],
  templateUrl: './product-category.component.html',
  styleUrl: `./product-category.component.css`,
  standalone: true,
})
export class ProductCategoryComponent implements OnInit {
  private host = environment.apiUrl;

  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  page: number = 0;
  size: number = 4;
  productCategories: ProductCategory[] = [];
  loading = false;
  errorMessage = '';

  constructor(private productCategoryService: ProductCategoryService, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.getProductCategories();
  }

  getProductCategories(event?: PageEvent) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
    this.loadProductCategories();
  }

  loadProductCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productCategoryService.getProductCategories(this.pageIndex, this.pageSize).subscribe({ // Using observer object
      next: (response: any) => {
        this.productCategories = response.content;
        this.totalCount = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading product categories:', 'Close', {duration: 3000});
        this.loading = false;
      },
      complete: () => {
        // Optional: Called when the observable completes (not common for HTTP requests)
        // console.log('Observable completed');
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProductCategories();
  }

}
