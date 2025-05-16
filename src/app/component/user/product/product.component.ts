// Angular Core and Common Modules
import { Component, OnInit, DEFAULT_CURRENCY_CODE, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgOptimizedImage, registerLocaleData, CurrencyPipe } from '@angular/common'; // Added registerLocaleData, CurrencyPipe
import { FormsModule } from '@angular/forms'; // Needed for [(ngModel)]

// Angular Material Modules (used in the template)
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; // Added MatAutocompleteSelectedEvent

// RxJS (Preserving imports as provided)
import { Observable, of, Subject } from 'rxjs'; // Keep Observable, Added of (for catchError), Subject
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'; // Keep catchError, Added tap, debounceTime, distinctUntilChanged, switchMap

// Services (using paths relative to this component as in the provided imports)
import { ProductService } from '../../../services/product.service';
import { StaffService } from '../../../services/staff.service';
import { CustomerService } from '../../../services/customer.service';
import { VehicleService } from '../../../services/vehicle.service';
// Importing the concrete implementation as used in the constructor injection
import { BookingServiceImpl } from '../../../services/impl/booking-service-impl.service';


// Models (using paths relative to this component as in the provided imports)
import { ProductDto } from '../../../model/dto/product-dto';
import { StaffDTO } from '../../../model/dto/staff-dto';
import { CustomerDto } from '../../../model/dto/customer-dto';
import { VehicleDTO } from '../../../model/dto/vehicle-dto';
import { BookingDTO } from '../../../model/dto/booking-dto';
import { ApiResponse } from '../../../model/response/ApiResponse'; // Using ApiResponse casing from provided imports
// Import all necessary enums from your booking model file (Adjust path if needed)
import { BookingStatus, PaymentMethodType, PaymentStatus } from '../../../model/booking'; // Added PaymentMethodType


@Component({
  selector: 'app-user-product-list',
  templateUrl: './user-product.component.html',
  styleUrls: ['./user-product.component.css'],
  imports: [
    // Include all necessary Angular/Material modules used in the template
    FormsModule,
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    NgOptimizedImage,
    CurrencyPipe, // Added CurrencyPipe to imports
    MatTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  providers: [
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'KES' },
    CurrencyPipe // Needed for the currency pipe in the template
  ],
})
export class UserProductComponent implements OnInit {
  // ========== Component State Properties ==========
  isLoading = true; // Set to true initially, managed by data loading
  errorMessage = '';
  activeProductId: number | null = null; // To track which product's panel is active for autocomplete filtering
  expandedProductId: number | null = null; // To track which product panel is expanded

  // Pagination
  pageSize = 8;
  pageIndex = 0;
  totalCount = 0;

  // Data Collections (Full lists for filtering/display)
  products: ProductDto[] = [];
  staffList: StaffDTO[] = [];
  customers: CustomerDto[] = []; // Full list of customers for filtering
  vehicles: VehicleDTO[] = []; // Full list of vehicles for filtering

  // Product-specific State - Individual properties keyed by product ID
  selectedStaffId: { [productId: number]: number | null } = {}; // Staff selection per product
  selectedCustomerId: { [productId: number]: number | null } = {}; // Customer ID selection per product
  customerInput: { [productId: number]: string } = {}; // Customer input text per product
  filteredCustomers: { [productId: number]: CustomerDto[] } = {}; // Filtered customers per product

  selectedVehicleId: { [productId: number]: number | null } = {}; // Vehicle ID selection per product (Added)
  licensePlateInput: { [productId: number]: string } = {}; // License plate input text per product (Added)
  filteredVehicles: { [productId: number]: VehicleDTO[] } = {}; // Filtered vehicles per product (Added)

  enteredPrice: { [productId: number]: number | null } = {}; // Price input per product
  notes: { [productId: number]: string } = {}; // Notes input per product


  // Keep existing properties for initialization/data loading if still used elsewhere,
  // but the core booking form state is managed within individual properties.
  mainImageUrls: { [productId: number]: string | undefined } = {};

  // Subject for license plate search (kept as per provided imports, though not directly used in the current filtering logic)
  // The direct service call in onLicensePlateInputChange is used instead.
  private licensePlateSearchTerms = new Subject<string>();


  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private staffService: StaffService,
    private customerService: CustomerService,
    private bookingService: BookingServiceImpl, // Using the concrete implementation name as in the import
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef, // ChangeDetectorRef for manual updates with autocomplete
  ) { }

  // ========== Lifecycle Methods ==========
  ngOnInit(): void {
    this.isLoading = true; // Set loading to true at the start
    this.getProducts();
    this.loadStaff();
    this.loadCustomers();
    this.loadVehicles(); // Load all vehicles initially for local filtering

    // Keeping the subscription setup as per provided imports, although filtering is done directly in input change handler
    // This might be useful for other features or logging.
    this.setupLicensePlateSearchSubscription();
  }

   /**
    * Sets up the subscription for reactive license plate searching as the user types.
    * This method does NOT load all license plates initially. It listens to the
    * licensePlateSearchTerms Subject and triggers a search via VehicleService
    * when the user types at least 2 characters.
    * Keeping this method as it was present in the provided imports context.
    */
  setupLicensePlateSearchSubscription(): void {
    this.licensePlateSearchTerms.pipe(
      debounceTime(300), // Wait 300ms after keystroke
      distinctUntilChanged(), // Only emit if the search term has changed
      tap(term => console.log('License plate search term from Subject:', term)), // Added tap for logging
      switchMap((term: string) => {
        // This switchMap block is currently redundant for updating the UI's filtered list
        // because onLicensePlateInputChange calls the service directly.
        // It could be used for a different search mechanism or side effects.
        console.log('Executing switchMap for term:', term);
         // Example: If you wanted to use this pipe to update filtered list:
         // if (term.trim().length >= 2) {
         //     return this.vehicleService.findMatchingLicensePlates(term).pipe(
         //         catchError(error => { console.error('Error searching via pipe:', error); return of([]); })
         //     );
         // } else {
         //     return of([]);
         // }
         return of([]); // Returning empty observable as the direct call handles filtering
      })
    ).subscribe(plates => {
       // This subscribe block would receive results if the switchMap returned an observable with data.
       // Currently, it receives empty arrays from the example switchMap.
       // The actual update to filteredLicensePlates[productId] happens in onLicensePlateInputChange
    });
  }


  // ========== Product Methods ==========
  getProducts(event?: PageEvent): void {
    this.isLoading = true; // Set loading true for products specifically
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    this.productService.getAllProducts(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => { // Assuming response has content and totalElements
        this.products = response.content;
        this.totalCount = response.totalElements;
        this.initializeProductFields(); // Initialize state for each product
        this.isLoading = false; // Set loading false after products are processed
      },
      error: (error) => {
        this.errorMessage = 'Error loading products';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        this.isLoading = false; // Set loading false on error
      },
    });
  }

  private initializeProductFields(): void {
    this.products.forEach((product) => {
      const productId = product.id!;
      this.mainImageUrls[productId] = product.mainImageUrl ?? undefined;

      // Initialize individual state properties for each product
      this.selectedStaffId[productId] = null;
      this.selectedCustomerId[productId] = null;
      this.customerInput[productId] = '';
      this.filteredCustomers[productId] = [...this.customers]; // Initialize with full customer list

      this.selectedVehicleId[productId] = null; // Initialize selected vehicle ID
      this.licensePlateInput[productId] = '';
      this.filteredVehicles[productId] = [...this.vehicles]; // Initialize with full vehicle list

      this.enteredPrice[productId] = null;
      this.notes[productId] = ''; // Initialize notes as empty string
    });
  }


  handlePageEvent(event: PageEvent): void {
    this.getProducts(event); // Call getProducts for pagination
  }

  /**
   * Toggles the expanded state of a product panel.
   * @param productId The ID of the product panel to toggle.
   */
  togglePanel(productId: number): void {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }


  // ========== Data Loading Methods ==========
  loadStaff(): void {
    // Assuming getAllStaff also supports pagination, adjust if needed
    this.staffService.getAllStaff(0, 1000).subscribe({ // Load enough staff for selection
      next: (response: any) => { // Assuming response has content
        this.staffList = response.content;
      },
      error: (err) => {
        this.snackBar.open('Error loading staff.', 'Close', { duration: 3000 });
      },
    });
  }

  loadCustomers(): void {
    // Assuming getAllCustomers returns an array of CustomerDto directly
    this.customerService.getAllCustomers().subscribe({
      next: (response: CustomerDto[]) => {
        this.customers = response;
        // Update filteredCustomers for all products after customers are loaded
        this.products.forEach(product => {
          const productId = product.id!;
          // Update the filtered list for this product
          this.filteredCustomers[productId] = [...this.customers];
        });
      },
      error: (error) => {
        this.snackBar.open('Error loading customers.', 'Close', { duration: 3000 });
      },
    });
  }

  loadVehicles(): void {
    // Assuming getAllVehicles returns an array of VehicleDTO directly
    this.vehicleService.getAllVehicles().subscribe({
      next: (response: VehicleDTO[]) => {
        this.vehicles = response;
        // Update filteredVehicles for all products after vehicles are loaded
        this.products.forEach(product => {
          const productId = product.id!;
          // Update the filtered list for this product
          this.filteredVehicles[productId] = [...this.vehicles];
        }
      );
      },
      error: (error) => {
        this.snackBar.open('Error loading vehicles.', 'Close', { duration: 3000 });
      },
    });
  }

  onCustomerSelect(customer: CustomerDto, productId: number): void {

    this.activeProductId = productId;
    this.selectedCustomerId[productId] = customer?.id || null;
    this.customerInput[productId] = customer ? customer.name : '';
    this.filteredCustomers[productId] = [...this.customers];
    this.cdr.detectChanges();
  }

  onCustomerInputChange(event: Event, productId: number): void {
    if (this.activeProductId !== productId) return;

    const value = (event.target as HTMLInputElement).value;
    this.customerInput[productId] = value;

    const filterValue = value.toLowerCase();
    this.filteredCustomers[productId] = this.customers.filter(c =>
      c.name.toLowerCase().includes(filterValue) ||
      (c.email && c.email.toLowerCase().includes(filterValue))
    );

    // If the input value is empty, clear the selected customer ID.
    if (value.trim() === '') {
        this.selectedCustomerId[productId] = null;
    }
    // Otherwise, check if the currently selected customer ID is still present in the *filtered* list.
    // If not, clear the selected ID. This handles cases where the user types over a selected value.
    else if (this.selectedCustomerId[productId] !== null && !this.filteredCustomers[productId].some(c => c.id === this.selectedCustomerId[productId])) {
      this.selectedCustomerId[productId] = null;
    }

    this.cdr.detectChanges();
  }

  // Display function for the customer autocomplete.
  displayCustomer = (customer: CustomerDto): string => customer?.name || '';


  onLicensePlateSelect(vehicle: VehicleDTO, productId: number): void {

    this.activeProductId = productId;
    this.selectedVehicleId[productId] = vehicle?.id || null;
    this.licensePlateInput[productId] = vehicle ? vehicle.licensePlate : '';
    this.filteredVehicles[productId] = [...this.vehicles];
    this.cdr.detectChanges();
  }

   onLicensePlateInputChange(event: Event, productId: number): void {
    if (this.activeProductId !== productId) return;

    const value = (event.target as HTMLInputElement).value;
    this.licensePlateInput[productId] = value; // Update the input state property

    const filterValue = value.toLowerCase();
    // Filter the local list of vehicles by license plate containing the input value
    this.filteredVehicles[productId] = this.vehicles.filter(vehicle =>
      vehicle.licensePlate.toLowerCase().includes(filterValue)
      // Add other fields for vehicle filtering if desired (make, model, etc.)
      // || (vehicle.make && vehicle.make.toLowerCase().includes(filterValue))
      // || (vehicle.model && vehicle.model.toLowerCase().includes(filterValue))
    );

    // If the input value is empty, clear the selected vehicle ID.
    if (value.trim() === '') {
       this.selectedVehicleId[productId] = null;
    }
    // Otherwise, check if the currently selected vehicle ID is still present in the *filtered* list.
    // If not, clear the selected ID. This mirrors the logic in the refined onCustomerInputChange.
    else if (this.selectedVehicleId[productId] !== null && !this.filteredVehicles[productId].some(v => v.id === this.selectedVehicleId[productId])) {
       this.selectedVehicleId[productId] = null;
    }

    this.cdr.detectChanges();
  }

  // Display function for the license plate autocomplete.
  displayLicensePlate(vehicle: VehicleDTO): string {
    return vehicle?.licensePlate || '';
  }

  // ========== Staff Methods ==========
  onStaffSelectionChange(productId: number, staffId: number): void {
    this.selectedStaffId[productId] = staffId;
  }

  // ========== Form Field Methods ==========
  onPriceChange(value: number | null, productId: number): void {
    this.enteredPrice[productId] = value !== null ? value : null; // Use null for number input reset
  }

  onNotesChange(value: string | undefined, productId: number): void {
    this.notes[productId] = value || ''; // Store as empty string if undefined
  }


  // ========== Booking Methods - Simplified Flow ==========

  /**
   * Initiates the booking process for a specific product.
   * Collects data from the component state, validates, and sends the BookingDTO to the backend.
   * @param productId The ID of the product to book.
   */
  bookWash(productId: number): void {
    // 1. Collect final values from the state for this product
    const staffId = this.selectedStaffId[productId];
    const customerId = this.selectedCustomerId[productId]; // Selected customer ID (null if new name typed)
    const customerInput = this.customerInput[productId]?.trim() || ''; // Typed customer name (trimmed)
    const selectedVehicleId = this.selectedVehicleId[productId]; // Selected vehicle ID (null if new plate typed)
    const licensePlateInput = this.licensePlateInput[productId]?.trim() || ''; // Typed license plate (trimmed)
    const price = this.enteredPrice[productId]; // Use null if not entered
    const notes = this.notes[productId] || '';

    // 2. Validate collected data - Ensure required fields are present
    if (!staffId) {
       this.snackBar.open('Please select a staff member.', 'Close', { duration: 3000 });
       return;
    }
    if (!customerId && customerInput === '') {
        this.snackBar.open('Please select a customer or enter a new customer name.', 'Close', { duration: 3000 });
        return;
    }
     if (!selectedVehicleId && !licensePlateInput) { 
        this.snackBar.open('Please select a vehicle or enter a license plate.', 'Close', { duration: 3000 });
        return;
    }
    if (price === null || price <= 0) {
       this.snackBar.open('Please enter a valid price.', 'Close', { duration: 3000 });
       return;
    }

    // 3. Build and send the Booking DTO to the backend
    // The backend will handle the find/create logic for customer and vehicle based on the DTO
    this.buildAndSendBooking(
        productId, staffId, customerId, customerInput, selectedVehicleId, licensePlateInput, price, notes
    );
  }


  /**
   * Constructs the BookingDTO and sends it to the backend booking service.
   * The backend is responsible for resolving customer and vehicle based on the provided IDs/names/plates.
   * @param productId The ID of the product.
   * @param staffId The ID of the selected staff.
   * @param customerId The ID of the selected customer (null if new name typed).
   * @param customerInput The typed customer name (used if customerId is null).
   * @param selectedVehicleId The ID of the selected vehicle (null if new plate typed).
   * @param licensePlateInput The typed license plate (used if selectedVehicleId is null).
   * @param price The price charged.
   * @param notes The notes for the booking.
   */
  private buildAndSendBooking(
    productId: number,
    staffId: number, // Guaranteed staff ID by validation
    customerId: number | null, // Selected customer ID (null if new name typed)
    customerInput: string, // Typed customer name (trimmed)
    selectedVehicleId: number | null, // Selected vehicle ID (null if new plate typed)
    licensePlateInput: string, // Typed license plate (trimmed)
    price: number, // Guaranteed valid price
    notes: string
  ): void {
    this.isLoading = true; // Show loading indicator

    // Create the Booking DTO based on the collected data
    const bookingData: BookingDTO = {
      productId: productId,
      staffId: staffId,
      notes: notes,
      priceCharged: price,

      // Customer handling: Send EITHER ID (if selected) OR Name (if typed and no ID selected)
      customerId: customerId || undefined, // Send selected ID or undefined
      customerName: customerId ? null : (customerInput || null), // Send name ONLY if NO ID was selected

      // Vehicle handling: Send EITHER ID (if selected) OR Plate (if typed and no ID selected)
      vehicleId: selectedVehicleId || undefined, // Send selected ID or undefined
      licensePlate: selectedVehicleId ? null : (licensePlateInput || null), // Send plate ONLY if NO ID was selected

      // Other fields (use defaults or nulls as per DTO and backend expectations)
      // Assuming commissionRate is calculated on backend or has a default
      jobType: 'standard', // Assuming default job type

      // Status fields (use defaults as set in backend createBooking or provide here if frontend dictates)
      status: BookingStatus.PENDING, // Example default
      paymentStatus: PaymentStatus.UNPAID, // Example default

      // Timestamps/Calculated fields - likely set on backend, but included in DTO type
      createdAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      commissionCalculated: undefined,
      estimatedDurationMinutes: undefined,
      actualDurationMinutes: undefined,

      // Add any other fields if required by BookingDTO and collected in UI
    };

    // Send the DTO to the backend booking service
    this.bookingService.createBooking(bookingData).subscribe({
      next: (response: ApiResponse<BookingDTO>) => this.handleBookingResponse(response, productId),
      error: (error) => this.handleError('Booking failed', error),
    });
  }


  private handleBookingResponse(response: ApiResponse<BookingDTO>, productId: number): void {
    if (response.success && response.data) {
      this.snackBar.open('Booking successful!', 'Close', { duration: 3000 });
      this.resetProductFields(productId);
      // Refresh data lists that might have new items (new customer or vehicle created by backend)
      // This is important so the autocomplete can find newly created items next time.
      this.loadCustomers();
      this.loadVehicles();
    } else {
      // Log error message from backend response if available
      const errorMsg = response?.message || 'Unknown error occurred.';
      this.handleError('Booking failed: ' + errorMsg);
    }
    this.isLoading = false; // Hide loading spinner after response
  }

  // ========== Utility Methods ==========
  /**
   * Resets the input fields and state for a specific product after successful booking.
   * @param productId The ID of the product whose fields should be reset.
   */
  private resetProductFields(productId: number): void {
     // Reset staff and customer IDs
     this.selectedStaffId[productId] = null;
     this.selectedCustomerId[productId] = null;
     this.customerInput[productId] = ''; // Reset customer input
     this.filteredCustomers[productId] = [...this.customers]; // Reset filtered customers

     this.selectedVehicleId[productId] = null; // Reset selectedVehicleId
     this.licensePlateInput[productId] = '';
     this.filteredVehicles[productId] = [...this.vehicles]; // Reset filtered vehicles

     this.enteredPrice[productId] = null; // Use null for number input reset
     this.notes[productId] = ''; // Reset notes to empty string

     // Note: Clearing Mat Autocomplete inputs visually might require additional logic
     // or binding to the autocomplete's panelClosed event to clear the input text if no option is selected.
     this.cdr.detectChanges(); // Manually trigger change detection to clear inputs
  }

  private handleError(message: string, error?: any): void {
    this.errorMessage = error?.error?.message || message; // Try to get backend error message
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    this.isLoading = false;
  }

  // The setupLicensePlateSearchSubscription method using a Subject is not needed
  // because the filtering and service call are handled directly in onLicensePlateInputChange.
  // The Subject approach is more common with Reactive Forms or if you needed more complex
  // debouncing/caching across multiple inputs.

}
