import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AnalysisComponent } from './analysis/analysis.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: '**', redirectTo: '/login' }
];
