import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Incident } from '../../../core/services/incident.service';

@Component({
  selector: 'app-resolve-incident-dialog',
  standalone: false,
  templateUrl: './resolve-incident-dialog.component.html',
  styleUrls: ['./resolve-incident-dialog.component.scss'],
})
export class ResolveIncidentDialogComponent {
  resolveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ResolveIncidentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { incident: Incident }
  ) {
    this.resolveForm = this.fb.group({
      managerComment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.resolveForm.valid) {
      this.dialogRef.close(this.resolveForm.value.managerComment);
    }
  }
}
