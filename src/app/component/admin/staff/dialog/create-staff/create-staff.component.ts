// create-staff-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { StaffService } from '../../../../../services/staff.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StaffType } from '../../../../../model/dto/staff-dto';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-staff-dialog',
  templateUrl: './create-staff.component.html',
  styleUrls: ['./create-staff.component.css'],
  imports:[CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
    MatDatepickerModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
})
export class CreateStaffComponent {
  staffForm: FormGroup;
  isLoading = false;
  staffTypes: StaffType[] = ['ATTENDANT', 'SUPERVISOR', 'MANAGER'];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateStaffComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.staffForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      staffType: ['ATTENDANT', Validators.required],
      hireDate: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      hourlyRate: ['', [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      return;
    }

    this.isLoading = true;
    const staffData = {
      ...this.staffForm.value,
      user: { id: this.data.userId }
    };

    this.staffService.createStaff(staffData).subscribe({
      next: () => {
        this.snackBar.open('Staff member created successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true); // Pass true to indicate success
      },
      error: (err) => {
        this.snackBar.open('Failed to create staff member', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}