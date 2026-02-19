import { Routes } from '@angular/router';
import { Login as LoginComponent } from './login/login';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent }
];
