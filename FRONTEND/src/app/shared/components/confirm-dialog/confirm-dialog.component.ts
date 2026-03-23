import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-header">
      <div class="confirm-icon-wrap">
        <mat-icon>warning_amber</mat-icon>
      </div>
      <div>
        <h2>Confirmar eliminacion</h2>
        <p class="confirm-subtitle">{{ data.message }}</p>
      </div>
    </div>
    <mat-dialog-content>
      <div class="confirm-body">
        <mat-icon>info_outline</mat-icon>
        <span>Esta accion no se puede deshacer.</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" class="btn-cancel">Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true" class="btn-delete">
        <mat-icon>delete</mat-icon>
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px 24px 12px;
    }
    .confirm-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #fef2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #dc2626; font-size: 24px; width: 24px; height: 24px; }
    }
    h2 {
      margin: 0 0 4px;
      font-size: 17px;
      font-weight: 600;
      color: #1e293b;
    }
    .confirm-subtitle {
      margin: 0;
      font-size: 14px;
      color: #475569;
    }
    mat-dialog-content {
      padding: 4px 24px 8px !important;
    }
    .confirm-body {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      mat-icon { color: #d97706; font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      span { color: #92400e; font-size: 13px; }
    }
    mat-dialog-actions {
      padding: 12px 24px 16px !important;
      gap: 8px;
    }
    .btn-cancel {
      color: #64748b;
      font-weight: 500;
      &:hover { background: #f1f5f9; }
    }
    .btn-delete {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35); }
    }
  `],
})
export class ConfirmDialogComponent {
  data = inject<{ message: string }>(MAT_DIALOG_DATA);
}
