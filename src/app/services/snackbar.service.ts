// snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { info } from 'console';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 2000,
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

  info(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['info-snackbar', 'top']
    });
  }

  warning(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar', 'top']
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['error-snackbar', 'top']
    });
  }
}