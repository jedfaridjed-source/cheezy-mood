import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: '', loadComponent: () => import('./app/home.component').then(m => m.HomeComponent) },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient()]}).catch(err => console.error(err));
