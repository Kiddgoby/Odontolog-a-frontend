import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { Patient } from './patient/patient';
import { NewPatient } from './new-patient/new-patient';
import { PacienteDetail } from './paciente-detail/paciente-detail';

import { Tratamientos } from './tratamientos/tratamientos';
import { Appointment } from './appointment/appointment';
import { Calendar } from './calendar/calendar';
import { ConnectivityTest } from './connectivity-test/connectivity-test';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, data: { title: 'Accés' } },
    { path: 'home', component: HomeComponent, data: { title: 'Panell de Control' } },
    { path: 'patient', component: Patient, data: { title: 'Llistat de Pacients' } },
    { path: 'patient/new', component: NewPatient, data: { title: 'Nou Pacient' } },
    { path: 'patient/:id', component: PacienteDetail, data: { title: 'Detall de Pacient' } },
    { path: 'patient/:id/odontograma', loadComponent: () => import('./odontograma/odontograma').then(m => m.Odontograma), data: { title: 'Odontograma' } },
    { path: 'tratamientos', component: Tratamientos, data: { title: 'Gestió de Tractaments' } },
    { path: 'citas', component: Appointment, data: { title: 'Cites' } },
    { path: 'calendar', component: Calendar, data: { title: 'Calendari' } },
    { path: 'test-connection', component: ConnectivityTest, data: { title: 'Prova de Connexió' } },
    { path: '**', redirectTo: 'login' }
];
