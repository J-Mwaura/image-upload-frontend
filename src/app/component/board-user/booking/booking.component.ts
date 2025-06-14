import { Component, OnInit } from '@angular/core';
import { BookingServiceImpl } from '../../../services/impl/booking-service-impl.service'; // Adjust path if needed
import { BookingDTO } from '../../../model/dto/booking-dto'; // Adjust path if needed
import { ApiResponse } from '../../../model/response/ApiResponse'; // Adjust path if needed
import { VehicleDTO } from '../../../model/dto/vehicle-dto'; // Import VehicleDTO for search results

import { Observable, of, Subject } from 'rxjs'; // Import necessary RxJS features
import { catchError, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators'; // Import RxJS operators
import { VehicleService } from '../../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { BookingStatus, PaymentStatus } from '../../../model/booking';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking', // Custom HTML tag for this component
  templateUrl: './booking.component.html', // Link to the component's HTML file
  styleUrls: ['./booking.component.css'], // Link to the component's CSS file
  imports:[ReactiveFormsModule, CommonModule, MatCardModule]
})
export class BookingComponent implements OnInit {

  bookings$!: Observable<ApiResponse<BookingDTO>>; // Observable to hold the list of bookings
  matchingLicensePlates$!: Observable<ApiResponse<Set<string>>>; // Observable for license plate search results
  matchingVehicles$!: Observable<ApiResponse<Set<VehicleDTO>>>; // Observable for vehicle search results (by license plate containing)

  // Subjects for handling search input changes
  private licensePlateSearchTerms = new Subject<string>();
  private vehicleSearchTerms = new Subject<string>();


  // Variables for UI feedback
  loadingLicensePlateSearch = false;
  loadingVehicleSearch = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  bookingForm!: FormGroup;
  statuses = Object.values(BookingStatus);
  paymentStatuses = Object.values(PaymentStatus);
  
  constructor(
    private bookingService: BookingServiceImpl,
    private vehicleService: VehicleService,
    private fb: FormBuilder,
    ) { }

  ngOnInit(): void {

    this.initBookingForm();
    // Initialize the license plate search functionality (string only)
    this.matchingLicensePlates$ = this.licensePlateSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term.trim() && term.trim().length >= 2) { // Add client-side validation for min length
          this.loadingLicensePlateSearch = true;
          this.errorMessage = null;
          // Call the correct method on bookingService for string search
          return this.vehicleService.searchLicensePlates(term).pipe(
             catchError(error => {
                this.errorMessage = `License plate search failed: ${error.message}`;
                this.loadingLicensePlateSearch = false;
                // Ensure consistent ApiResponse structure is returned on error
                return of({ message: this.errorMessage, success: false, data: new Set<string>() } as ApiResponse<Set<string>>);
             })
          );
        } else {
           // Return an empty observable or a default value if search term is empty or too short
           return of({ message: '', success: true, data: new Set<string>() } as ApiResponse<Set<string>>);
        }
      }),
       map(response => {
         this.loadingLicensePlateSearch = false;
         return response;
       })
    );

     // Initialize the vehicle search functionality (by license plate containing)
     this.matchingVehicles$ = this.vehicleSearchTerms.pipe(
       debounceTime(300),
       distinctUntilChanged(),
       switchMap((term: string) => {
         if (term.trim() && term.trim().length >= 2) { // Add client-side validation for min length
           this.loadingVehicleSearch = true;
           this.errorMessage = null;
           // FIX: Call the correct method on vehicleService for VehicleDTO search
           // Assuming vehicleService.findByLicensePlateContainingIgnoreCase returns Observable<ApiResponse<Set<VehicleDTO>>>
           return this.vehicleService.searchVehicleLicensePlate(term).pipe( // <<< Call VehicleService method >>>
              catchError(error => {
                 this.errorMessage = `Vehicle search failed: ${error.message}`;
                 this.loadingVehicleSearch = false;
                 // Ensure consistent ApiResponse structure is returned on error
                 return of({ message: this.errorMessage, success: false, data: new Set<VehicleDTO>() } as ApiResponse<Set<VehicleDTO>>);
              })
           );
         } else {
            // Return an empty observable or a default value if search term is empty or too short
            return of({ message: '', success: true, data: new Set<VehicleDTO>() } as ApiResponse<Set<VehicleDTO>>);
         }
       }),
       map(response => {
         this.loadingVehicleSearch = false;
         return response;
       })
     );
  }

  // Method to initialize the booking form with FormBuilder
  initBookingForm(): void {
    this.bookingForm = this.fb.group({
      productId: [null, Validators.required], // Product ID is required
      customerId: [null],
      customerName: [null],
      staffId: [null],
      vehicleId: [null],
      licensePlate: [null],
      // createdAt, updatedAt, startedAt, completedAt, commissionCalculated are likely backend generated/calculated
      createdAt: [null],
      updatedAt: [null],
      startedAt: [null],
      completedAt: [null],
      commissionCalculated: [null],

      // Initialize enums with default values or null if allowed by DTO
      status: [BookingStatus.PENDING, Validators.required], // Default status, required
      paymentStatus: [PaymentStatus.UNPAID, Validators.required], // Default payment status, required
      paymentMethod: [null], // Optional

      estimatedDurationMinutes: [null],
      actualDurationMinutes: [null],
      priceCharged: [null, Validators.required], // Price Charged is required
      commissionRate: [null], // Optional
      notes: [null], // Optional
      jobType: [null] // Optional
    }, { validators: [this.customerValidator, this.vehicleValidator] }); // Add custom validators
  }

  // Custom validator to ensure either customerId or customerName is provided
  customerValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const customerId = control.get('customerId')?.value;
    const customerName = control.get('customerName')?.value;

    if (!customerId && (!customerName || customerName.trim().length === 0)) {
      return { 'customerRequired': true }; // Return error object if neither is provided
    }
    return null; // Return null if validation passes
  };

  // Custom validator to ensure either vehicleId or licensePlate is provided
  vehicleValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const vehicleId = control.get('vehicleId')?.value;
    const licensePlate = control.get('licensePlate')?.value;

    if (!vehicleId && (!licensePlate || licensePlate.trim().length === 0)) {
      return { 'vehicleRequired': true }; // Return error object if neither is provided
    }
    return null; // Return null if validation passes
  };

  // Method to trigger the license plate string search
  searchLicensePlates(term: string): void {
    this.licensePlateSearchTerms.next(term); // Push the search term into the Subject
  }

   // Method to trigger the vehicle search by license plate containing
   searchVehicles(term: string): void {
     this.vehicleSearchTerms.next(term); // Push the search term into the Subject
   }


  // Method to handle form submission and create a booking
  createBooking(): void {
    this.errorMessage = null; // Clear previous errors
    this.successMessage = null; // Clear previous success messages

    // Check if the form is valid before submitting
    if (this.bookingForm.invalid) {
      this.errorMessage = 'Please fill in all required fields and correct validation errors.';
      // Optionally mark all fields as touched to display validation messages
      this.bookingForm.markAllAsTouched();
      return;
    }

    // Get the form values as a BookingDTO object
    const bookingDto: BookingDTO = this.bookingForm.value as BookingDTO;

    // Call the service method to create the booking
    this.bookingService.createBooking(bookingDto).subscribe({
      next: (response: ApiResponse<BookingDTO>) => {
        if (response.success) {
          this.successMessage = response.message || 'Booking created successfully!';
          // Clear the form or reset it
          this.resetForm(); // Use resetForm to clear all fields
          // Optionally reload the list of all bookings
          //this.loadAllBookings();
        } else {
          this.errorMessage = response.message || 'Failed to create booking.';
        }
      },
      error: (error) => {
        this.errorMessage = `Error creating booking: ${error.message}`;
      }
    });
  }

  // Helper method to reset the form
  resetForm(): void {
    // Use the built-in reset method for FormGroup
    this.bookingForm.reset({
      // Provide default values when resetting if needed
      productId: null, // Reset to null or a default value
      customerId: null,
      customerName: null,
      staffId: null,
      vehicleId: null,
      licensePlate: null,
      createdAt: null,
      updatedAt: null,
      startedAt: null,
      completedAt: null,
      commissionCalculated: null,
      status: BookingStatus.PENDING, // Reset to default status
      paymentStatus: PaymentStatus.UNPAID, // Reset to default payment status
      paymentMethod: null,
      estimatedDurationMinutes: null,
      actualDurationMinutes: null,
      priceCharged: null,
      commissionRate: null,
      notes: null,
      jobType: null
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

}
