import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/authService.service';
import {FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule]
})
export class RegisterComponent implements OnInit {

  isLoading: boolean = false;
  // form: any = {};
  registrationForm!: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  successMessage: string | null = null;  // For success messages
  errorMessage: string | null = null;  // For error messages

  constructor(private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]]
    });
  }

  // onSubmit() {
  //   if (this.registrationForm.valid) {
  //     this.authService.register(this.registrationForm.value).subscribe({
  //       next: (response) => {
  //         console.log('Registration successful!', response);
  //         // Handle successful registration (e.g., redirect to login page)
  //         this.successMessage = 'Registration successful! Please check your email to activate your account.'; // Set the success message
  //       this.errorMessage = null; // Clear any previous errors
  //       this.registrationForm.reset(); // Optional: Reset the form after successful registration
  //       },
  //       error: (error: HttpErrorResponse) => { // Type the error as HttpErrorResponse
  //         console.error('Registration failed!', error);
  //         this.errorMessage = this.getErrorMessage(error); // Call the helper function (see below)
  //         this.successMessage = null; // Clear any previous success messages
  //         this.isLoading = false;
  //     }       
  //     });
  //   } 
  // }

  onSubmit() {

    this.authService.register(this.registrationForm.value).subscribe({
      next: (response) => {
        //console.log('Registration successful:', response);
        this.successMessage = "Registration successful! Please check your email to activate your account.";
        this.errorMessage = null;
        this.registrationForm.reset();
      },
      error: (error: Error) => { // The error is now of type Error
        //console.error('Registration error:', error);
        this.errorMessage = error.message; // Directly access the message
      }
    });
  }

}