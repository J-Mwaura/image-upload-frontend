import {Component, OnInit} from '@angular/core';
import {ProductCategoryService} from '../../../services/product-category.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {environment} from '../../../../environments/environment';
import {ProductCategory} from '../../../model/ProductCategory';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTable, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ApiResponse} from '../../../model/response/ApiResponse';
import {
  ConfirmDeleteDialogComponent
} from '../../dialog/confirm-delete-dialog-component/confirm-delete-dialog-component.component';
import {MatDialog,MatDialogModule} from '@angular/material/dialog';
import {ProductCategoryFormComponent} from '../product-category-form/product-category-form.component';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ProductImage} from '../../../model/ProductImage.model';

@Component({
  selector: 'app-product-category',
  imports: [CommonModule, NgOptimizedImage, MatCardModule, MatProgressSpinner, MatTableModule,
    MatPaginator, MatError, MatTable, MatIconModule, MatButtonModule, MatDialogModule, MatFormField, MatInput, ReactiveFormsModule],
  templateUrl: './product-category.component.html',
  styleUrl: `./product-category.component.css`,
  standalone: true,
})
export class AdminProductCategoryComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'url', 'actions'];

  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  page: number = 0;
  size: number = 4;
  productCategories: ProductCategory[] = [];
  loading = false;
  errorMessage = '';
  editingCategoryId: number | null | undefined = null;

  categoryEditForm: FormGroup<{
    name: FormControl<string | null>
  }>;

  constructor(private productCategoryService: ProductCategoryService, private dialog: MatDialog,
              private snackBar: MatSnackBar, private fb: FormBuilder
  )
  {
    this.categoryEditForm = this.fb.group({
      name: new FormControl<string | null>('', Validators.required)
    });
  }

  get nameControl(): FormControl<string | null> {
    return this.categoryEditForm.controls.name;
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

  delete(productCategory: ProductCategory) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { itemName: productCategory.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategory(productCategory.id!);
      }
    });
  }

  deleteCategory(id: number | undefined): void {
    if (id === undefined) {
      this.snackBar.open('Invalid category ID for deletion.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.productCategoryService.deleteProductCategory(id).subscribe({
      next: (response: ApiResponse<ProductCategory>) => {
        this.loading = false;
        if (response.success) { //Category with ID 12 deleted successfully. Category deleted successfully
          this.snackBar.open(`Category ID ${id}: ${response.message}`, 'Close', { duration: 3000 });
          // Refresh the product categories list after deletion
          this.getProductCategories();
        } else {
          this.snackBar.open(`Error deleting category with ID ${id}: ${response.message}`, 'Close', { duration: 5000 });
          this.errorMessage = `Error deleting category: ${response.message}`;
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(`Error deleting category with ID ${id}. Please try again.`, 'Close', { duration: 5000 });
        this.errorMessage = 'An unexpected error occurred during deletion.';
        console.error('Error deleting product category:', error);
      }
    });
  }

  openCreateCategoryDialog(): void {
    const dialogRef = this.dialog.open(ProductCategoryFormComponent, {
      width: '500px',
      data: {} // You can pass initial data if needed for editing
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCategory(result); // Call saveCategory with the data from the form
      }
    });
  }

  saveCategory(categoryData: ProductCategory): void {
    this.loading = true;
    this.errorMessage = '';

    this.productCategoryService.saveProductCategory(categoryData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.snackBar.open(`Category "${response.data?.name}" saved successfully.`, 'Close', { duration: 3000 });
          this.loadProductCategories(); // Refresh the list
        } else {
          this.errorMessage = `Error saving category: ${response.message}`;
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'An unexpected error occurred while saving the category.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        console.error('Error saving product category:', error);
      }
    });
  }

  openEditCategoryDialog(category: ProductCategory) {
    this.editingCategoryId = category.id;
    this.categoryEditForm.patchValue({ name: category.name });
    this.categoryEditForm.get('name')?.valueChanges.subscribe(value => {
      const index = this.productCategories.findIndex(c => c.id === this.editingCategoryId);
      if (index > -1) {
        this.productCategories[index].name = value;
      }
    });
  }

  saveCategoryEdit(category: ProductCategory) {
    if (this.categoryEditForm.valid && this.editingCategoryId === category.id) {
      const updateData: { name: string } = {
        name: this.categoryEditForm.value.name || '' // Fallback for null
      };
      this.productCategoryService.updateProductCategory(category.id, updateData)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
            this.editingCategoryId = null; // Exit edit mode
            this.loadProductCategories(); // Reload the list
          },
          error: (error) => {
            this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
          }
        });
    }
  }

  cancelCategoryEdit() {
    this.editingCategoryId = null;
    this.loadProductCategories(); // Reload to discard changes
  }

}
