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
import { StaffService } from '../../../services/staff.service';
import { StaffDTO } from '../../../model/dto/staff-dto';
import { CustomerService } from '../../../services/customer.service';
import { CustomerDto } from '../../../model/dto/customer-dto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-user-product-list',
  templateUrl: './user-product.component.html',
  styleUrls: ['./user-product.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    NgOptimizedImage,
    CurrencyPipe,
    MatTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
})
export class UserProductComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  products: ProductDto[] = [];
  totalCount = 0;
  pageSize = 8;
  pageIndex = 0;
  mainImageUrls: { [productId: number]: string | undefined } = {};
  expandedProductId: number | null = null;
  selectedStaffId: { [productId: number]: number | null } = {};
  staffList: StaffDTO[] = [];
  customers: CustomerDto[] = [];
  selectedCustomerId: { [productId: number]: number | null } = {};
  enteredPrice: { [productId: number]: number | null } = {};

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private staffService: StaffService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.loadStaff();
    this.loadCustomers();
  }

  getProducts(event?: PageEvent): void {
    this.isLoading = true;
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    this.productService.getAllProducts(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.totalCount = response.totalElements;
        this.products.forEach((product) => {
          this.mainImageUrls[product.id!] =
            product.mainImageUrl ?? undefined;
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading products';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.getProducts(event);
  }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService.getAllStaff(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        this.staffList = response.content;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading staff:', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (response: CustomerDto[]) => {
        this.customers = response;
        this.isLoading = false;
        console.log('Loaded customers', this.customers);
      },
      error: (error) => {
        this.snackBar.open('Error loading customers', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  onCustomerSelect(productId: number, customerId: number) {
    this.selectedCustomerId[productId] = customerId;
    console.log(`Selected customer ID: ${customerId} for product: ${productId}`);
  }

  onStaffSelectionChange(productId: number, staffId: number): void {
    this.selectedStaffId[productId] = staffId;
    console.log(`Staff ${staffId} selected for product ${productId}`);
  }

  bookWash(productId: number): void {
    const selectedStaff = this.selectedStaffId[productId];
    const selectedCustomer = this.selectedCustomerId[productId];
    const enteredPrice = this.enteredPrice[productId] || 0;

    if (!selectedStaff || !selectedCustomer) {
      this.snackBar.open(
        'Please select a staff member and a customer for this product.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    if (enteredPrice <= 0) {
      this.snackBar.open(
        'Please enter a valid price for the product.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    const bookingData = {
      customerId: selectedCustomer,
      productId: productId,
      staffId: selectedStaff,
      price: enteredPrice,
    };
    console.log(bookingData);

    // Send this data to your Spring backend using a service.  You'll need to create a booking service.
    // this.bookingService.createBooking(bookingData).subscribe({
    //  next: (response) => {
    //    this.snackBar.open('Booking successful!', 'Close', { duration: 3000 });
    //    console.log('Booking successful:', response);
    //  },
    //  error: (error) => {
    //    this.snackBar.open('Booking failed!', 'Close', { duration: 3000 });
    //    console.error('Booking failed:', error);
    //  },
    // });
  }

  onPriceChange(value: number | null, productId: number) {
    this.enteredPrice[productId] = value !== null ? value : 0;
    // Add any additional logic here
  }
}

