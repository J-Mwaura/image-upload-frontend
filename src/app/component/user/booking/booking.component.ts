import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking, BookingStatus, PaymentStatus } from '../../../model/booking';

@Component({
  standalone: true,
  selector: 'app-booking-form',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  @Input() booking?: Booking;
  @Output() submitBooking = new EventEmitter<Partial<Booking>>();

  bookingForm: FormGroup;
  statuses = Object.values(BookingStatus);
  paymentStatuses = Object.values(PaymentStatus);

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      productId: ['', Validators.required],
      customerId: [''],
      scheduledTime: [''],
      status: ['PENDING', Validators.required],
      paymentStatus: ['UNPAID'],
      notes: ['']
    });
  }

  ngOnChanges() {
    if (this.booking) {
      this.bookingForm.patchValue({
        ...this.booking,
        scheduledTime: this.formatDateForInput(this.booking.scheduledTime)
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.submitBooking.emit(this.bookingForm.value);
    }
  }

  private formatDateForInput(dateString?: string | null): string | null {
    if (!dateString) return null;
    return dateString.substring(0, 16); // Converts ISO to datetime-local format
  }
}
