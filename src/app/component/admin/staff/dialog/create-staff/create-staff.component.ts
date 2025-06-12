// create-staff-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { StaffService } from '../../../../../services/staff.service';
import { StaffDTO, StaffType } from '../../../../../model/dto/staff-dto';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../../model/user';
import { UserService } from '../../../../../services/user.service';
import { UserDTO } from '../../../../../model/dto/user-dto';
import { Page } from '../../../../../model/page';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-create-staff-dialog',
  templateUrl: './create-staff.component.html',
  styleUrls: ['./create-staff.component.css'],
  imports:[CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatDatepickerModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
})
export class CreateStaffComponent implements OnInit{
  availableUsers: User[] = [];
  isLoadingUsers = false; 
  staffForm!: FormGroup;
  isLoading = false;
  staffTypes: StaffType[] = ['attendant', 'supervisor', 'manager'];
  currentPage: any;
  totalItems: any;

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateStaffComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAvailableUsers();
  }

  initializeForm(){
    this.staffForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      staffType: ['ATTENDANT', Validators.required],
      hireDate: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      hourlyRate: ['', [Validators.required, Validators.min(0)]],
      isActive: [true],
      userId: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValues = this.staffForm.value;

    const staffData: Partial<StaffDTO> = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phone: formValues.phone,
      staffType: formValues.staffType,
      hireDate: formValues.hireDate,
      pinCode: formValues.pinCode,
      hourlyRate: formValues.hourlyRate,
      isActive: formValues.isActive,
      // For 'user' property, create a UserDTO object with the selected userId from the form
      user: { id: formValues.userId } as UserDTO,
      // 'isAvailable' typically depends on 'isActive' and potentially other factors
      isAvailable: formValues.isActive && formValues.isAvailable,
    };

   this.staffService.createStaff(staffData).subscribe({
      next: () => {
        this.snackBar.open('Staff member created successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        const errorMessage = err.message;
        this.snackBar.open(errorMessage, 'Close', { duration: 5000,
          verticalPosition: 'top', 
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
  this.dialogRef.close(false);
}

  loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getAvailableUsers().subscribe({
      next: (page: Page<UserDTO>) => {
        this.availableUsers = page.content.map(convertUserDTOToUser);
        this.isLoadingUsers = false;
        
        // Optional: Store pagination info if needed
        this.currentPage = page.number;
        this.totalItems = page.totalElements;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
      }
    });
  }
}

function convertUserDTOToUser(dto: UserDTO): User {
  return {
    ...dto,
    roles: dto.roles || [] // Provide empty array if undefined
  };
}