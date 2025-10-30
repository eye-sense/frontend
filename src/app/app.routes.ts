import { Routes } from '@angular/router';
import { AnalysisComponent } from './analysis/analysis.component';
import { HistoricComponent } from './historic/historic.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'historic', component: HistoricComponent },
  { path: '**', redirectTo: '/login' }
];
