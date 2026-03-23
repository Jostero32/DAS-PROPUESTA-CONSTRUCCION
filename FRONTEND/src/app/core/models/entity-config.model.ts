export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'enum';
  enumLabels?: Record<string, string>;
}

export interface FormFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'boolean' | 'password';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  entitySource?: { apiPath: string; labelKey: string; valueKey?: string };
}

export interface EntityPageConfig {
  title: string;
  apiPath: string;
  columns: ColumnDef[];
  formFields: FormFieldDef[];
}
