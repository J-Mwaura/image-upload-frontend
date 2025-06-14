import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/authService';
import {FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LowercaseTrimDirective } from '../component/directives/lowercase.directive';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, LowercaseTrimDirective ]
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

  onSubmit() {
    const formData = this.registrationForm.value;
    formData.username = formData.username.toLowerCase();
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