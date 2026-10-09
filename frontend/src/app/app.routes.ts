import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { RegisterComponent } from './components/register-component/register-component';
import { AdminComponent } from './components/admin-component/admin-component';
import { adminGuard } from './guards/admin-guard';
import { HomeComponent } from './components/home-component/home-component';
import { ProductDetailsComponent } from './components/product-details-component/product-details-component';
import { ClientComponent } from './components/client-component/client-component';
import { PrinterComponent } from './components/printer-component/printer-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'client', component: ClientComponent },
  { path: 'printer', component: PrinterComponent },

  // parameter routes
  { path: 'product/:id', component: ProductDetailsComponent },

  // wildcard route, redirect to home
  { path: '**', redirectTo: '' }
];
