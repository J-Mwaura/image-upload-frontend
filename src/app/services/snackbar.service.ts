// snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 80000,
    verticalPosition: 'top',
    horizontalPosition: 'center'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['success-snackbar', 'top']
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['error-snackbar', 'top']
    });
  }
}