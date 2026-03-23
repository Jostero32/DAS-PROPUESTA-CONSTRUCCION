import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormFieldDef } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';

export interface EntityFormDialogData {
  title: string;
  fields: FormFieldDef[];
  isEdit: boolean;
  values: Record<string, any>;
}

@Component({
  selector: 'app-entity-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './entity-form-dialog.component.html',
  styleUrl: './entity-form-dialog.component.scss',
})
export class EntityFormDialogComponent implements OnInit {
  data = inject<EntityFormDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<EntityFormDialogComponent>);
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  form!: FormGroup;
  entityOptions: Record<string, { value: number; label: string }[]> = {};
  loadingOptions = false;
  hidePassword = true;

  ngOnInit(): void {
    const controls: Record<string, any> = {};
    const sourcesToLoad: { key: string; apiPath: string; labelKey: string; valueKey: string }[] = [];

    for (const field of this.data.fields) {
      if (field.type === 'password' && this.data.isEdit) continue;

      const val = this.data.values[field.key] ?? (field.type === 'boolean' ? false : '');
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === 'email') validators.push(Validators.email);
      controls[field.key] = [val, validators];

      if (field.entitySource) {
        sourcesToLoad.push({
          key: field.key,
          apiPath: field.entitySource.apiPath,
          labelKey: field.entitySource.labelKey,
          valueKey: field.entitySource.valueKey || 'id',
        });
      }
    }

    this.form = this.fb.group(controls);
    this.loadEntitySources(sourcesToLoad);
  }

  private loadEntitySources(sources: { key: string; apiPath: string; labelKey: string; valueKey: string }[]): void {
    if (!sources.length) return;
    this.loadingOptions = true;
    let pending = sources.length;

    for (const src of sources) {
      this.api.getAll(src.apiPath).subscribe({
        next: (items) => {
          this.entityOptions[src.key] = items.map((item: any) => ({
            value: item[src.valueKey],
            label: `${item[src.valueKey]} - ${item[src.labelKey]}`,
          }));
          pending--;
          if (pending === 0) this.loadingOptions = false;
        },
        error: () => {
          this.entityOptions[src.key] = [];
          pending--;
          if (pending === 0) this.loadingOptions = false;
        },
      });
    }
  }

  get visibleFields(): FormFieldDef[] {
    return this.data.fields.filter(
      (f) => !(f.type === 'password' && this.data.isEdit),
    );
  }

  getInputType(field: FormFieldDef): string {
    if (field.type === 'email') return 'email';
    if (field.type === 'number') return 'number';
    if (field.type === 'date') return 'date';
    return 'text';
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
