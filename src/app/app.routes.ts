import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { Patient } from './patient/patient';
import { NewPatient } from './new-patient/new-patient';
import { PacienteDetail } from './paciente-detail/paciente-detail';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'patients', component: Patient },
    { path: 'patients/new', component: NewPatient },
    { path: 'patients/:id', component: PacienteDetail }
];
