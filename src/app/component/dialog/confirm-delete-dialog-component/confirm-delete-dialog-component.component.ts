// confirm-delete-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-dialog',
    imports: [MatDialogModule],
    template: `
        <h1 mat-dialog-title>Confirm Delete</h1>
        <div mat-dialog-content>
            <p>Are you sure you want to delete <strong style="color: red;">{{ data.imageName }}?</strong></p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">Cancel</button>
            <button mat-button [mat-dialog-close]="true" cdkFocusInitial style="margin-left: 8px;">Delete</button>
        </div>
    `
})
export class ConfirmDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageName: string }
    ) {this.data.imageName = this.data.imageName.toUpperCase();}

    onNoClick(): void {
        this.dialogRef.close(false); // Pass false to indicate cancel
    }
}