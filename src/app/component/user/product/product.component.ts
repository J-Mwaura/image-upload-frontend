import { Component, OnInit, DEFAULT_CURRENCY_CODE, ChangeDetectorRef  } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ProductDto } from '../../../model/dto/product-dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, NgOptimizedImage, registerLocaleData } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { StaffService } from '../../../services/staff.service'; // Keep StaffService import
import { StaffDTO } from '../../../model/dto/staff-dto'; // Keep StaffDTO import
import { CustomerService } from '../../../services/customer.service'; // Keep CustomerService import
import { CustomerDto } from '../../../model/dto/customer-dto'; // Keep CustomerDto import - Ensure this path is correct
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; // Keep if needed elsewhere, but removed from customer
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BookingServiceImpl } from '../../../services/servicesImpl/booking-service-impl.service'; // Inject the concrete service implementation
import { BookingDTO } from '../../../model/dto/booking-dto'; // Assuming this is the updated DTO
import { BookingStatus, PaymentStatus } from '../../../model/booking'; // Import Enums
import { ApiResponse } from '../../../model/response/ApiResponse'; // Import ApiResponse
import { Observable, of } from 'rxjs'; // Keep Observable, Added of (for catchError)
import { catchError, tap } from 'rxjs/operators'; // Keep catchError, Added tap
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Import MatAutocompleteModule

// Removed locale registration as it's not directly related to the error fix
// import localeEn from '@angular/common/locales/en'; // Default English locale
// import localeSwKE from '@angular/common/locales/sw-KE'; // Swahili (Kenya) locale
// Register Kenyan locale data
// registerLocaleData(localeEn);
// registerLocaleData(localeSwKE);


@Component({
  selector: 'app-user-product-list',
  templateUrl: './user-product.component.html',
  styleUrls: ['./user-product.component.css'],
  // Added MatAutocompleteModule to the imports array
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
    MatSelectModule, // Keep if needed elsewhere
    MatInputModule,
    MatAutocompleteModule, // Add MatAutocompleteModule here
  ],
  providers: [
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'KES' },
    CurrencyPipe
  ],
})
export class UserProductComponent implements OnInit {
  isLoading = true; // Set to true initially, will be managed by individual loads
  errorMessage = '';
  products: ProductDto[] = [];
  totalCount = 0;
  pageSize = 8;
  pageIndex = 0;
  mainImageUrls: { [productId: number]: string | undefined } = {};
  expandedProductId: number | null = null;

  // Properties to hold selected staff, customer, entered price, notes, and license plate per product
  selectedStaffId: { [productId: number]: number | null } = {}; // Keep staff selection property
  staffList: StaffDTO[] = []; // Keep staff list property
  customers: CustomerDto[] = []; // Keep customer list property
  selectedCustomerId: { [productId: number]: number | null } = {}; // Keep customer selection property

  // Added properties for customer autocomplete
  customerInput: { [productId: number]: string | undefined } = {}; // To hold the text entered in the customer input
  filteredCustomers: { [productId: number]: CustomerDto[] } = {}; // To hold the filtered customer suggestions

  // Properties to hold entered price, notes, and license plate per product
  enteredPrice: { [productId: number]: number | null } = {};
  notes: { [productId: number]: string | undefined } = {}; // Property to store notes per product
  licensePlate: { [productId: number]: string | undefined } = {}; // Added: Property to store license plate per product

  // Added property to store all loaded license plates (for autocomplete suggestions)
  allLicensePlates: string[] = [];
  // Added property to store filtered license plates per product (for autocomplete suggestions)
  filteredLicensePlates: { [productId: number]: string[] } = {};


  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private staffService: StaffService, // Keep StaffService injection
    private customerService: CustomerService, // Keep CustomerService injection
    private bookingService: BookingServiceImpl, // Inject the concrete service implementation
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit started. Loading initial data (Products, Staff, Customers, and License Plates)...');
    this.isLoading = true; // Set loading to true at the start

    // Load data individually as requested, managing loading state
    this.getProducts(); // This will set isLoading to false when products are loaded

    // Load staff list
    this.loadStaff();

    // Load customer list
    this.loadCustomers();

    // Load all license plates using the refactored method
    this.loadAllLicensePlates();
  }

  /**
   * Fetches products with pagination.
   * @param event Optional PageEvent for pagination.
   */
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
        this.products.forEach((product) => {
          const productId = product.id!;
          // Initialize mainImageUrls for each product
          this.mainImageUrls[productId] = product.mainImageUrl ?? undefined;
          // Initialize selected staff, customer, price, notes, and license plate for each product
          this.selectedStaffId[productId] = null; // Keep initialization for staff
          this.selectedCustomerId[productId] = null; // Keep initialization for customer ID
          this.customerInput[productId] = ''; // Initialize customer input as undefined
          this.filteredCustomers[productId] = [...this.customers]; // Initialize filtered customers with all customers
          this.enteredPrice[productId] = null;
          this.notes[productId] = undefined; // Initialize notes as undefined
          this.licensePlate[productId] = undefined; // Added: Initialize license plate as undefined (input will be empty)

          // Initialize filteredLicensePlates for this product with all available plates
          // This ensures autocomplete works even if products load before allLicensePlates
          this.filteredLicensePlates[productId] = [...this.allLicensePlates];
        });
        this.isLoading = false; // Set loading false after products are processed
        console.log('Loaded products and initialized per-product fields.');
      },
      error: (error) => {
        this.errorMessage = 'Error loading products';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        this.isLoading = false; // Set loading false on error
        console.error('Error loading products:', error);
      },
    });
  }

  /**
   * Handles page changes for the product list.
   * @param event The PageEvent from the paginator.
   */
  handlePageEvent(event: PageEvent): void {
    this.getProducts(event); // Call getProducts for pagination
  }

  /**
   * Loads the list of staff members. (Called in ngOnInit)
   */
  loadStaff(): void { // Return type is void as it manages component state directly
    console.log('Attempting to load staff...');
    // Assuming getAllStaff also supports pagination, adjust if needed
    this.staffService.getAllStaff(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => { // Assuming response has content
        this.staffList = response.content;
        console.log('Loaded staff', this.staffList);
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        this.snackBar.open('Error loading staff.', 'Close', { duration: 3000 });
        // Decide if staff loading failure should block the whole page or just show an error
        // For now, it just logs and shows a snackbar, doesn't block products/license plates
      },
    });
  }

  /**
   * Loads the list of customers. (Called in ngOnInit)
   */
  loadCustomers(): void { // Return type is void as it manages component state directly
    console.log('Attempting to load customers...');
    // Assuming getAllCustomers returns an array of CustomerDto directly
    this.customerService.getAllCustomers().subscribe({
      next: (response: CustomerDto[]) => {
        this.customers = response;
        console.log('Loaded customers', this.customers);
        // Initialize filteredCustomers for all existing products after customers are loaded
        this.products.forEach(product => {
           const productId = product.id!;
           this.filteredCustomers[productId] = [...this.customers];
        });
        console.log('Initialized filteredCustomers for products after loading customers.');
      },
      error: (error) => {
        console.error('Error loading customers', error);
        this.snackBar.open('Error loading customers.', 'Close', { duration: 3000 });
        // Decide if customer loading failure should block the whole page or just show an error
        // For now, it just logs and shows a snackbar, doesn't block products/license plates
      },
    });
  }


  /**
   * Added: Loads all distinct license plates from the backend. (Called in ngOnInit)
   * This is for autocomplete suggestions. Refactored to match loadStaff style.
   */
  loadAllLicensePlates(): void { // Changed return type to void
    console.log('Attempting to load all license plates...');
    this.bookingService.getAllLicensePlates().subscribe({ // Subscribing directly
      next: (response: ApiResponse<string[] | null>) => { // Expecting ApiResponse<string[]> based on your service
        console.log('Raw license plates response from backend (getAll):', response); // Log the raw response

        // Check if the response is successful and contains data which is an array
        if (response && response.success && response.data && Array.isArray(response.data)) {
           this.allLicensePlates = response.data;
           console.log('Loaded all license plates successfully:', this.allLicensePlates);

           // Initialize filteredLicensePlates for all currently loaded products
           // This ensures autocomplete suggestions are available once plates are loaded
           this.products.forEach(product => {
              const productId = product.id!;
              this.filteredLicensePlates[productId] = [...this.allLicensePlates];
           });
           console.log('Initialized filteredLicensePlates for products.');

        } else {
           // Handle cases where response is null, not successful, or data is not an array
           console.error('Backend returned unsuccessful or unexpected response format or null for loading all license plates:', response);
           this.allLicensePlates = []; // Ensure array is empty on unexpected response
           // Also ensure filtered lists are empty
            this.products.forEach(product => {
              const productId = product.id!;
              this.filteredLicensePlates[productId] = [];
           });
           console.log('allLicensePlates and filteredLicensePlates set to empty array.');
           // Optionally set an error message if this is critical for the user
           // this.errorMessage = response?.message || 'Failed to load available license plates.';
        }
      },
      error: (err) => {
        // This block handles HTTP errors (like 404, 500)
        console.error('Error loading all license plates (HTTP Error):', err); // More specific error log
        this.allLicensePlates = []; // Ensure array is empty on error
         // Also ensure filtered lists are empty
         this.products.forEach(product => {
              const productId = product.id!;
              this.filteredLicensePlates[productId] = [];
           });
        console.log('allLicensePlates and filteredLicensePlates set to empty array due to error.');
        this.snackBar.open('Error loading available license plates.', 'Close', { duration: 3000 }); // Optionally inform user
      }
    });
  }


  /**
   * Filters the locally loaded license plates based on the search term for a specific product.
   * Updates the filteredLicensePlates array for that product.
   * @param searchTerm The term to filter by.
   * @param productId The ID of the product.
   */
  filterLicensePlates(searchTerm: string, productId: number): void {
    const filterValue = searchTerm ? searchTerm.toLowerCase() : '';
    // Filter against the locally stored allLicensePlates list and assign to the specific product's filtered list
    this.filteredLicensePlates[productId] = this.allLicensePlates.filter(plate =>
      plate.toLowerCase().includes(filterValue)
    );
    console.log(`Filtered license plates for product ${productId} with term "${searchTerm}":`, this.filteredLicensePlates[productId]);
  }

  /**
   * Added: Handles input changes in the customer autocomplete input field.
   * Filters the customer list based on the entered value.
   * @param event The input event.
   * @param productId The ID of the product associated with this input.
   */
  // Add this property to track the active product
 activeProductId: number | null = null;

// Replace the existing onCustomerSelect method with:
onCustomerSelect(customer: CustomerDto, productId: number): void {
  console.log(`Customer selected for product ${productId}:`, customer);
  
  this.activeProductId = productId;
  this.selectedCustomerId[productId] = customer?.id || null;
  this.customerInput[productId] = customer ? customer.name : '';
  this.filteredCustomers[productId] = [...this.customers];
  this.cdr.detectChanges();
}

// Replace the existing onCustomerInputChange method with:
onCustomerInputChange(event: Event, productId: number): void {
  if (this.activeProductId !== productId) return;
  
  const value = (event.target as HTMLInputElement).value;
  this.customerInput[productId] = value;
  
  const filterValue = value.toLowerCase();
  this.filteredCustomers[productId] = this.customers.filter(c => 
    c.name.toLowerCase().includes(filterValue) || 
    (c.email && c.email.toLowerCase().includes(filterValue))
  );
  
  if (!this.filteredCustomers[productId].some(c => c.id === this.selectedCustomerId[productId])) {
    this.selectedCustomerId[productId] = null;
  }
}

// Replace the existing displayCustomer method with:
displayCustomer = (customer: CustomerDto): string => customer?.name || '';



  /**
   * Handles the selection of a staff member for a specific product. (Kept)
   * @param productId The ID of the product.
   * @param staffId The ID of the selected staff member.
   */
  onStaffSelectionChange(productId: number, staffId: number): void {
    this.selectedStaffId[productId] = staffId;
    console.log(`Staff ${staffId} selected for product ${productId}`);
  }

  /**
   * Handles the price input change for a specific product.
   * @param value The entered price value.
   * @param productId The ID of the product.
   */
  onPriceChange(value: number | null, productId: number): void {
    this.enteredPrice[productId] = value !== null ? value : 0;
    console.log(`Price ${value} entered for product ${productId}`);
  }

  /**
   * Handles the notes input change for a specific product.
   * @param value The entered notes value.
   * @param productId The ID of the product.
   */
  onNotesChange(value: string | undefined, productId: number): void {
      this.notes[productId] = value;
      console.log(`Notes for product ${productId}: ${value}`);
  }

  /**
   * Handles the license plate input change for a specific product.
   * Updates the component property and triggers local filtering for autocomplete suggestions.
   * @param event The input event.
   * @param productId The ID of the product.
   */
  onLicensePlateChange(event: Event, productId: number): void {
      // Extract the value from the input event
      const value = (event.target as HTMLInputElement).value;
      this.licensePlate[productId] = value;
      console.log(`License Plate input changed for product ${productId}: ${value}`);
      // Trigger local filtering when the input changes to update autocomplete suggestions
      this.filterLicensePlates(value || '', productId); // Pass the extracted value to filterLicensePlates
  }

  /**
   * Added: Display function for the license plate autocomplete.
   * @param plate The license plate string.
   * @returns The string to display in the input field after selection.
   */
  displayLicensePlate(plate: string | undefined): string {
    return plate ? plate : '';
  }


  /**
   * Initiates the booking process for a specific product.
   * Constructs a BookingDTO and sends it to the backend.
   * @param productId The ID of the product to book.
   */
  bookWash(productId: number): void {
    // Get the selected staff, customer, price, notes, and license plate for this specific product
    const selectedStaff = this.selectedStaffId[productId]; // Get selected staff
    const selectedCustomer = this.selectedCustomerId[productId]; // Get selected customer ID
    const enteredPrice = this.enteredPrice[productId] || 0; // Use 0 if null/undefined
    const enteredNotes = this.notes[productId]; // Get the notes for this product
    const enteredLicensePlate = this.licensePlate[productId]; // Added: Get the entered license plate
    const customerInputValue = this.customerInput[productId]; // Get the current value in the customer input field

    // Validate required selections
    // If a customer ID is not selected but there's text in the input, assume it's a new customer
    if (!selectedStaff || (!selectedCustomer && (!customerInputValue || customerInputValue.trim() === ''))) {
      this.snackBar.open(
        'Please select a staff member and either select a customer or enter a new customer name.',
        'Close',
        {
          duration: 3000,
        }
      );
      return; // Stop the booking process if validation fails
    }

    // Validate price
    if (enteredPrice <= 0) {
      this.snackBar.open(
        'Please enter a valid price for the product.',
        'Close',
        {
          duration: 3000,
        }
      );
      return; // Stop the booking process if validation fails
    }

    // Validate license plate (optional based on your requirements, but good practice)
    if (!enteredLicensePlate || enteredLicensePlate.trim() === '') {
         this.snackBar.open(
           'Please enter the vehicle license plate.',
           'Close',
           {
             duration: 3000,
           }
         );
         return; // Stop the booking process if validation fails
    }

    // Determine customerId to use for the booking
    let customerIdForBooking: number | undefined = selectedCustomer || undefined; // Use selected ID if available

    // If no customer was selected from autocomplete but text was entered,
    // attempt to find an existing customer by name or prompt to create a new one.
    // For simplicity in this step, we'll assume if text is present and no ID is selected,
    // the backend will handle creating a new customer or finding an existing one by name.
    // A more robust approach would be to explicitly create the customer first if not found.
    // For now, we'll just include the customer name in the notes or handle on backend.
    // A better approach is to create the customer first if not selected. Let's implement that.

    if (!selectedCustomer && customerInputValue && customerInputValue.trim() !== '') {
        // Attempt to find customer by name first (optional, if backend supports it)
        const existingCustomer = this.customers.find(c => c.name.toLowerCase() === customerInputValue.trim().toLowerCase());

        if (existingCustomer) {
            customerIdForBooking = existingCustomer.id;
            console.log(`Found existing customer by name: ${existingCustomer.name}, ID: ${customerIdForBooking}`);
        } else {
           // If no existing customer found by name, create a new one
           console.log(`Customer with name "${customerInputValue.trim()}" not found. Attempting to create new customer.`);
           const newCustomer: CustomerDto = { name: customerInputValue.trim() }; // Only name is required in your DTO

           // Subscribe to the customer creation observable
           this.customerService.createCustomer(newCustomer).subscribe({
               next: (response: ApiResponse<CustomerDto | null>) => {
                   if (response && response.success && response.data && response.data.id !== undefined && response.data.id !== null) {
                       customerIdForBooking = response.data.id;
                       console.log('New customer created successfully:', response.data);
                       this.snackBar.open(`New customer "${response.data.name}" created.`, 'Close', { duration: 3000 });
                       // Now proceed with booking using the new customer ID
                       this.proceedWithBooking(productId, selectedStaff, customerIdForBooking, enteredPrice, enteredNotes, enteredLicensePlate);
                   } else {
                       console.error('Failed to create new customer:', response);
                       const errorMessage = response?.message || 'Failed to create new customer.';
                       this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                       this.isLoading = false; // Ensure loading is off if creation fails
                   }
               },
               error: (error) => {
                   console.error('Error creating new customer:', error);
                   this.snackBar.open('Error creating new customer. Please try again.', 'Close', { duration: 5000 });
                   this.isLoading = false; // Ensure loading is off on error
               }
           });
           return; // Exit bookWash for now, it will be called again after customer creation
        }
    }

    // If we reached here, either a customer was selected, found by name, or the input was empty (already validated)
    // Now proceed with creating the booking
    this.proceedWithBooking(productId, selectedStaff, customerIdForBooking, enteredPrice, enteredNotes, enteredLicensePlate);
  }


  /**
   * Added: Helper method to proceed with booking after customer is determined/created.
   * @param productId The ID of the product.
   * @param staffId The ID of the selected staff.
   * @param customerId The ID of the customer for the booking.
   * @param price The price charged.
   * @param notes The notes for the booking.
   * @param licensePlate The license plate.
   */
  private proceedWithBooking(productId: number, staffId: number | null, customerId: number | undefined, price: number, notes: string | 
    undefined, licensePlate: string | undefined): void {
      // Ensure customerId is valid before creating booking
      if (customerId === undefined || customerId === null) {
          console.error('Cannot proceed with booking: Customer ID is not determined.');
          this.snackBar.open('Error: Could not determine customer for booking.', 'Close', { duration: 5000 });
          this.isLoading = false;
          return;
      }

      this.isLoading = true; // Start loading for the booking creation

      // Construct the BookingDTO object
      const bookingData: BookingDTO = {
        productId: productId,
        customerId: customerId, // Use the determined customer ID
        staffId: staffId || undefined, // Include the selected staff ID (use undefined if null)
        licensePlate: licensePlate?.trim() || null, // Include the entered license plate (trimming whitespace, use null if empty)

        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,

        startedAt: null,
        completedAt: null,
        estimatedDurationMinutes: null,
        actualDurationMinutes: null,

        priceCharged: price,
        notes: notes || null,
        jobType: 'standard',
      };

      this.bookingService.createBooking(bookingData).subscribe({
        next: (response: ApiResponse<BookingDTO>) => {
            if (response.success && response.data) {
                this.snackBar.open('Booking successful!', 'Close', { duration: 3000 });
                console.log('Booking successful:', response.data);
                this.resetProductFields(productId);
                this.loadAllLicensePlates();
                this.loadCustomers();
            } else {
                const errorMessage = response.message || 'Booking failed!';
                this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
            }
        },
        error: (error) => {
            this.snackBar.open('Booking failed! ' + error.error.message, 'Close', { duration: 3000 });
            console.error('Booking failed:', error);
        },
        complete: () => {
            this.isLoading = false;
        }
    });
  }


  /**
   * Added: Resets the input fields for a specific product after successful booking.
   * @param productId The ID of the product whose fields should be reset.
   */
  private resetProductFields(productId: number): void {
    // Reset staff and customer IDs
    this.selectedStaffId[productId] = null;
    this.selectedCustomerId[productId] = null;
    this.customerInput[productId] = ''; // Reset customer input
    this.filteredCustomers[productId] = [...this.customers]; // Reset filtered customers
    this.enteredPrice[productId] = 0; // Reset price to 0
    this.notes[productId] = ''; // Reset notes to empty string
    this.licensePlate[productId] = ''; // Reset license plate to empty string (empty string clears input)
    // Reset filtered license plates for this product to show all suggestions again
    this.filteredLicensePlates[productId] = [...this.allLicensePlates];
  }


  /**
   * Toggles the expanded state of a product panel.
   * @param productId The ID of the product panel to toggle.
   */
  togglePanel(productId: number): void {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }
}
