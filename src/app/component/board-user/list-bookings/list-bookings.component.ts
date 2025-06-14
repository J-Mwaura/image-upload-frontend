import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BookingServiceImpl } from '../../../services/impl/booking-service-impl.service';
import { ApiResponse } from "../../../model/response/ApiResponse";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingDTO } from '../../../model/dto/booking-dto';
import { Page } from '../../../model/page';
import { SnackbarService } from '../../../services/snackbar.service';
import { HttpClient } from '@angular/common/http';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table'; // For mat-table
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // For mat-paginator
import { MatSortModule } from '@angular/material/sort'; // For mat-sort (optional, but good for sorting)
import { MatButtonModule } from '@angular/material/button'; // For mat-icon-button
import { MatIconModule } from '@angular/material/icon';     // For mat-icon

@Component({
  standalone: true,
  selector: 'app-list-bookings',
  templateUrl: "./list-booking.component.html",
  styleUrls: ["./list-booking.component.css"],
  // Add Angular Material modules to imports
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class ListBookingsComponent implements OnInit {
  // Observables to hold the API response for bookings
  bookings$: Observable<ApiResponse<Page<BookingDTO>>> | undefined;

  // Data source for MatTable - this will be the 'content' array from your Page object
  // Note: MatTable typically works best with a simple array, not the full ApiResponse.
  // We'll extract the content in the tap operator.
  allBookings: BookingDTO[] = [];

  // Pagination and sorting state variables
  currentPage = 0;
  pageSize = 10;
  sortField = 'createdAt';
  sortDirection = 'desc';

  // Loading indicator for UI feedback
  isLoading = false;

  // Pagination metadata from the API response
  totalPages = 0;
  totalElements = 0;
  totalBookingsToday: number = 0;

  // Define columns to be displayed in the MatTable
  displayedColumns: string[] = [
    'bookingId',
    'customerName',
    'staffName',
    'licensePlate',
    'priceCharged',
    'createdAt',
    //'actions'
  ];


  private readonly snackbar = inject(SnackbarService);
  private readonly bookingService = inject(BookingServiceImpl);

  /**
   * Lifecycle hook: Called once, after the component is initialized.
   * Loads the bookings when the component starts.
   */
  ngOnInit(): void {
    this.loadBookings();
    this.fetchTotalBookingsToday();
  }

  loadBookings(): void {
    console.log('ListBookingsComponent: loadBookings method entered.');
    console.log('ListBookingsComponent: Current fetch parameters:', { page: this.currentPage, size: this.pageSize, sortBy: this.sortField, sortOrder: this.sortDirection });
    this.isLoading = true;

    console.log('ListBookingsComponent: About to call bookingService.getAllBookings() and subscribe.');

    // Directly subscribe to the Observable returned by the service
    this.bookingService.getAllBookings(
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        console.log('ListBookingsComponent: API response received (next callback).', response);
        // Corrected data access based on ApiResponse<Page<BookingDTO>> structure
        if (response?.success && response?.data) {
          this.allBookings = response.data.content;
          this.totalPages = response.data.page?.totalPages ?? 0; // Access totalPages from nested 'page'
          this.totalElements = response.data.page?.totalElements ?? 0; // Access totalElements from nested 'page'
          this.currentPage = response.data.page?.number ?? 0; // Access current page number from nested 'page'

          const message = response.data.content?.length > 0
            ? `${this.totalElements} bookings loaded`
            : 'No bookings found';
          this.snackbar.success(message);
        } else {
          this.snackbar.error(response?.message || 'No data received');
          this.allBookings = [];
        }
        this.isLoading = false; // Set loading to false on success
        console.log('ListBookingsComponent: loadBookings next callback finalized. isLoading:', this.isLoading);
      },
      error: (err) => {
        console.error('ListBookingsComponent: API error (error callback).', err);
        // Improved error message for snackbar consistency
        const errorMessage = err.message || (err.error?.message ? JSON.parse(err.error.message) : 'Failed to load bookings.');
        this.snackbar.error(errorMessage);
        this.allBookings = [];
        this.isLoading = false; // Set loading to false on error
        console.log('ListBookingsComponent: loadBookings error callback finalized. isLoading:', this.isLoading);
      },
      complete: () => {
        console.log('ListBookingsComponent: Observable completed.');
      }
    });

    console.log('ListBookingsComponent: Subscribe method called. Request initiated.');
  }

  fetchTotalBookingsToday(): void {
    this.bookingService.getTotalBookingsForToday().subscribe({
      next: (response) => {
        if (response.success && response.data !== null) {
          this.totalBookingsToday = response.data;
          console.log('Total bookings for today fetched:', this.totalBookingsToday);
        } else {
          console.error('Failed to get total bookings for today:', response.message);
          this.totalBookingsToday = 0; // Default to 0 on error
        }
      },
      error: (err) => {
        console.error('Error fetching total bookings for today:', err);
        this.snackbar.error('Failed to fetch total bookings for today.');
        this.totalBookingsToday = 0; // Default to 0 on error
      }
    });
  }

  get totalBookingsInDatabase(): string {
    return `(${this.totalElements})`;
  }


  /**
   * Handles page changes from MatPaginator.
   * @param event The PageEvent emitted by MatPaginator.
   */
  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  /**
   * Changes the sorting field and direction, then reloads bookings.
   * @param field The field to sort by.
   */
   changeSort(field: string): void {
    console.log('ListBookingsComponent: Sorting by:', field);
    if (this.sortField === field) {
      // If clicking the same field, toggle sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      // Do NOT reset currentPage to 0 here to prevent jumping if only direction changes
    } else {
      // If clicking a new field, set it as primary sort and default to 'desc'
      this.sortField = field;
      this.sortDirection = 'desc';
      this.currentPage = 0; // ONLY reset to first page when changing to a new sort field
    }
    this.loadBookings(); // Reload bookings with new sort
  }

  /**
   * Returns a sort icon based on the current sort field and direction.
   * @param field The field to check against current sort.
   * @returns '↑' for ascending, '↓' for descending, or empty string.
   */
  getSortIcon(field: string): string {
    if (this.sortField !== field) return ''; // No icon if not currently sorted by this field
    return this.sortDirection === 'asc' ? '↑' : '↓'; // Return appropriate arrow icon
  }

  /**
   * Handles booking deletion. You'll need to implement the actual service call.
   * @param bookingId The ID of the booking to delete.
   */
  deleteBooking(bookingId: number | undefined): void {
    if (bookingId === undefined) {
      this.snackbar.error('Cannot delete: Booking ID is missing.');
      return;
    }
    // Implement your delete logic here, e.g.:
    // this.bookingService.deleteBooking(bookingId).subscribe({
    //   next: () => {
    //     this.snackbar.success('Booking deleted successfully!');
    //     this.loadBookings(); // Reload the list
    //   },
    //   error: (err) => {
    //     this.snackbar.error(err.message || 'Failed to delete booking.');
    //   }
    // });
    this.snackbar.info(`Delete functionality for Booking ID: ${bookingId} needs to be implemented.`);
  }

  /**
   * Generates a descriptive string for the current page information.
   * @returns A string like "Page 1 of 5 (50 total bookings)".
   */
  get pageInfo(): string {
    // Display page information (adjusting currentPage for 1-based display)
    return `Page ${this.currentPage + 1} of ${this.totalPages} (${this.totalElements} total bookings)`;
  }
}
