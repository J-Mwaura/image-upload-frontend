// confirm-delete-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-dialog',
    imports: [MatDialogModule],
    template: `
        <h1 mat-dialog-title>Confirm Delete</h1>
        <div mat-dialog-content>
            <p>Are you sure you want to delete {{ data.imageName }}?</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">Cancel</button>
            <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Delete</button>
        </div>
    `
})
export class ConfirmDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageName: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false); // Pass false to indicate cancel
    }
}