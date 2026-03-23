import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActualizarFaseCobroPayload, EstadoFase, Fase } from '../../../core/models/obra.model';
import { ArchivoService } from '../../../core/services/archivo.service';

export interface CompletarFaseDialogData {
  fase: Fase;
  siguienteEstado: EstadoFase;
}

@Component({
  selector: 'app-completar-fase-dialog',
  standalone: true,
  imports: [
    DecimalPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './completar-fase-dialog.component.html',
  styleUrl: './completar-fase-dialog.component.scss',
})
export class CompletarFaseDialogComponent {
  private dialogRef = inject(MatDialogRef<CompletarFaseDialogComponent>);
  private archivoService = inject(ArchivoService);
  readonly data: CompletarFaseDialogData = inject(MAT_DIALOG_DATA);

  urlEvidencia = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  subiendo = signal(false);
  errorSubida = signal<string | null>(null);

  get esCobrar(): boolean {
    return this.data.siguienteEstado === 'cobrada';
  }

  get tituloAccion(): string {
    return this.esCobrar ? 'Marcar como cobrada' : 'Iniciar fase';
  }

  get iconoAccion(): string {
    return this.esCobrar ? 'paid' : 'play_arrow';
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!tiposPermitidos.includes(file.type)) {
      this.errorSubida.set('Solo se permiten imagenes (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorSubida.set('La imagen no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    this.subiendo.set(true);
    this.errorSubida.set(null);

    this.archivoService.subirArchivo(file).subscribe({
      next: (url) => {
        this.urlEvidencia.set(url);
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
    this.urlEvidencia.set(null);
    this.errorSubida.set(null);
  }

  confirmar(): void {
    if (this.subiendo()) return;

    const payload: ActualizarFaseCobroPayload = {
      estado: this.data.siguienteEstado,
    };

    if (this.urlEvidencia()) {
      payload.url_evidencia_foto = this.urlEvidencia()!;
    }

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
