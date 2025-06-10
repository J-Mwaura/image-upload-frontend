import { Component, OnInit } from '@angular/core';
import { StaffDTO } from '../../../../model/dto/staff-dto';
import { StaffService } from '../../../../services/staff.service';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateStaffComponent } from '../dialog/create-staff/create-staff.component';
import { AuthService } from '../../../../services/authService';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { SnackbarService } from '../../../../services/snackbar.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrl: `./staff.component.css`,
  standalone: true,
  imports: [CommonModule, MatPaginator, MatIconModule, MatTableModule, MatDialogModule,],
})
export class StaffComponent implements OnInit {
  staffList: StaffDTO[] = [];
  currentUserId: number | null = null;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  isLoading = true;
  userIdSubscription?: Subscription; 

  constructor(private staffService: StaffService, private authService: AuthService, 
   private snackbarService: SnackbarService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadStaff();
    this.getUserID();
  }

  ngOnDestroy(): void {
    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }
  }

  getUserID(): void {
    // Clear previous subscription to avoid memory leaks
    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe();
    }

    this.userIdSubscription = this.authService.getUserId().subscribe({
      next: (userId: number | null) => {
        this.currentUserId = userId;
        if (userId !== null) {
          // console.log('User ID in StaffComponent:', userId);
        } else {
          // console.log('User is not logged in.');
        }
      },
      error: (error: any) => {
        console.error('Error fetching user ID:', error); // Keep console.error for debugging
        this.snackbarService.error('Error fetching user ID.'); // <-- Use SnackbarService
      }
    });
  }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService.getAllStaff(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.staffList = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading staff:', err); // Keep console.error for debugging
        this.snackbarService.error('Error loading staff members.'); // <-- Use SnackbarService
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    if (!this.currentUserId) {
      console.error('No user ID available for staff creation dialog.');
      this.snackbarService.error('User not logged in. Cannot open staff creation dialog.'); // Inform user
      return;
    }

    const dialogRef = this.dialog.open(CreateStaffComponent, {
      width: '800px',
      data: { userId: this.currentUserId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If dialog closed with a 'true' result (success)
        this.snackbarService.success('Staff member created successfully!'); // <-- Optional: Show success here too
        this.loadStaff(); // Refresh the list if staff was created
      }
      // If result is false (dialog closed without success) or undefined (dialog dismissed), no action needed
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStaff();
  }
}