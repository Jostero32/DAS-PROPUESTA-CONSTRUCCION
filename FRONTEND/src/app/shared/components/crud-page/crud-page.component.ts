import { Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EntityPageConfig } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EntityFormDialogComponent } from '../entity-form-dialog/entity-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatTooltipModule,
    MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './crud-page.component.html',
  styleUrl: './crud-page.component.scss',
})
export class CrudPageComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  config!: EntityPageConfig;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.config = data['config'];
      this.displayedColumns = [...this.config.columns.map((c) => c.key), 'actions'];
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;
    this.api.getAll(this.config.apiPath).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        if (this.paginator) this.paginator.firstPage();
      },
      error: () => {
        this.notification.error('Error al cargar datos');
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  openForm(item?: any): void {
    const fieldCount = this.config.formFields.length;
    const width = fieldCount > 5 ? '680px' : '520px';

    const ref = this.dialog.open(EntityFormDialogComponent, {
      width,
      maxWidth: '95vw',
      maxHeight: '90vh',
      hasBackdrop: true,
      autoFocus: 'first-tabbable',
      panelClass: 'centered-dialog',
      data: {
        title: this.config.title,
        fields: this.config.formFields,
        isEdit: !!item,
        values: item || {},
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = item
        ? this.api.update(this.config.apiPath, item.id, result)
        : this.api.create(this.config.apiPath, result);

      obs.subscribe({
        next: () => {
          this.notification.success(item ? 'Actualizado correctamente' : 'Creado correctamente');
          this.loadData();
        },
        error: () => this.notification.error('Error al guardar'),
      });
    });
  }

  confirmDelete(item: any): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      hasBackdrop: true,
      panelClass: 'centered-dialog',
      data: { message: `Eliminar este registro de ${this.config.title}?` },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.remove(this.config.apiPath, item.id).subscribe({
        next: () => {
          this.notification.success('Eliminado correctamente');
          this.loadData();
        },
        error: () => this.notification.error('Error al eliminar'),
      });
    });
  }
}
