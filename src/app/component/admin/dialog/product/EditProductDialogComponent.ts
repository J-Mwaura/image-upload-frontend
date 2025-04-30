import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductDto } from '../../../../model/dto/product-dto';
import { ProductService } from '../../../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateProductDto } from '../../../../model/dto/update-product-dto';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-edit-product-dialog', 
    templateUrl: 'edit-product-dialog.component.html',
    styleUrls: ['edit-product-dialog.component.css'],
    imports: [ReactiveFormsModule, FormsModule, CommonModule, MatTableModule, MatIconModule, MatPaginatorModule,
      MatFormFieldModule, MatInputModule, MatDialogModule, 
      MatProgressSpinnerModule, MatButton], 
})
export class EditProductDialogComponent implements OnInit {
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDto,
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
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
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.editForm.patchValue(this.data);
    }
  }

  save(): void {
    if (this.editForm.valid && this.data && this.data.id) {
      const updatedProduct: UpdateProductDto = this.editForm.value;
      this.productService.updateProduct(this.data.id, updatedProduct).subscribe({
        next: (response) => {
          this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true); // Indicate success
        },
        error: (error) => {
          this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
          console.error('Error updating product:', error);
        },
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}