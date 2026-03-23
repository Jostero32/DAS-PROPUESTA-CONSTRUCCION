import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgregarGastoPayload } from '../../../core/models/obra.model';
import { ArchivoService } from '../../../core/services/archivo.service';

@Component({
  selector: 'app-registrar-gasto-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './registrar-gasto-dialog.component.html',
  styleUrl: './registrar-gasto-dialog.component.scss',
})
export class RegistrarGastoDialogComponent {
  private dialogRef = inject(MatDialogRef<RegistrarGastoDialogComponent>);
  private fb = inject(FormBuilder);
  private archivoService = inject(ArchivoService);

  /** URL del recibo subido */
  urlRecibo = signal<string | null>(null);

  /** Preview local del archivo seleccionado */
  previewUrl = signal<string | null>(null);

  /** Estado de subida */
  subiendo = signal(false);

  /** Error de subida */
  errorSubida = signal<string | null>(null);

  form = this.fb.group({
    concepto: ['', [Validators.required, Validators.maxLength(300)]],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fecha: [this.hoy(), Validators.required],
  });

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!tiposPermitidos.includes(file.type)) {
      this.errorSubida.set('Solo se permiten imagenes (JPG, PNG, WebP)');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorSubida.set('La imagen no debe superar 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    // Subir automáticamente
    this.subiendo.set(true);
    this.errorSubida.set(null);

    this.archivoService.subirArchivo(file).subscribe({
      next: (url) => {
        this.urlRecibo.set(url);
        this.subiendo.set(false);
      },
      error: () => {
        this.errorSubida.set('Error al subir la imagen. Intenta de nuevo.');
        this.subiendo.set(false);
      },
    });
  }

  quitarFoto(): void {
    this.previewUrl.set(null);
    this.urlRecibo.set(null);
    this.errorSubida.set(null);
  }

  guardar(): void {
    if (this.form.valid && !this.subiendo()) {
      const val = this.form.getRawValue();
      this.dialogRef.close({
        concepto: val.concepto!,
        monto: val.monto!,
        fecha: val.fecha!,
        url_recibo_foto: this.urlRecibo() || undefined,
      } satisfies AgregarGastoPayload);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
