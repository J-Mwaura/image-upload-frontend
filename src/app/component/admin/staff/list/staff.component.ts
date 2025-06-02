import { Component, OnInit } from '@angular/core';
import { StaffDTO } from '../../../../model/dto/staff-dto';
import { StaffService } from '../../../../services/staff.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CreateStaffComponent } from '../dialog/create-staff/create-staff.component';
import { AuthService } from '../../../../services/authService';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrl: `./staff.component.css`,
  standalone: true,
  imports: [CommonModule, MatPaginator, MatIconModule, MatTableModule,],
})
export class StaffComponent implements OnInit {
  staffList: StaffDTO[] = [];
  currentUserId: number | null = null;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  isLoading = true;
  userIdSubscription?: Subscription; 

  constructor(private staffService: StaffService, private authService: AuthService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadStaff();
    this.getUserID();
  }

  ngOnDestroy(): void { // Implement ngOnDestroy
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
        //console.log('User ID in StaffComponent:', userId);
        // You can use the userId here
      } else {
        //console.log('User is not logged in.');
        // Handle not logged in case
      }
    },
    error: (error: any) => {
      //console.error('Error fetching user ID:', error);
      this.snackBar.open('Error fetching user ID', 'Close', { duration: 3000 });
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
        this.snackBar.open('Error loading product categories:', 'Close', {duration: 3000});
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    if (!this.currentUserId) {
      console.error('No user ID available');
      return;
    }

  const dialogRef = this.dialog.open(CreateStaffComponent, {
    width: '800px',
    data: { userId: this.currentUserId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadStaff(); // Refresh the list if staff was created
    }
  });
}

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStaff();
  }
}