import { Routes } from '@angular/router';
import { Login as LoginComponent } from './login/login';
import { Home as HomeComponent } from './home/home';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent }
];
