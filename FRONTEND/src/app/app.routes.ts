import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CrudPageComponent } from './shared/components/crud-page/crud-page.component';
import { ObraDetalleComponent } from './features/obra-detalle/obra-detalle.component';
import { ENTITY_CONFIGS } from './features/configs/entities.config';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'obras/:id', component: ObraDetalleComponent },
      ...Object.entries(ENTITY_CONFIGS).map(([path, config]) => ({
        path,
        component: CrudPageComponent,
        data: { config },
      })),
    ],
  },
];
