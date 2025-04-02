// confirm-delete-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-dialog',
    imports: [MatDialogModule],
    templateUrl: './confirm-delete-dialog.html',
    styleUrl: `./confirm-delete-dialog.css`
})
export class ConfirmDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageName: string }
    ) { this.data.imageName = this.data.imageName.toUpperCase(); }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
}