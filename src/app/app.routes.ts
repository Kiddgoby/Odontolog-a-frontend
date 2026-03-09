import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { Patient } from './patient/patient';
import { NewPatient } from './new-patient/new-patient';
import { PacienteDetail } from './paciente-detail/paciente-detail';

import { Tratamientos } from './tratamientos/tratamientos';
import { Appointment } from './appointment/appointment';
import { Calendar } from './calendar/calendar';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
<<<<<<< HEAD
    { path: 'login', component: LoginComponent, data: { title: 'Acceso' } },
    { path: 'home', component: HomeComponent, data: { title: 'Panel de Control' } },
    { path: 'patient', component: Patient, data: { title: 'Listado de Pacientes' } },
    { path: 'patient/new', component: NewPatient, data: { title: 'Nuevo Paciente' } },
    { path: 'patient/:id', component: PacienteDetail, data: { title: 'Detalle de Paciente' } },
    { path: 'tratamientos', component: Tratamientos, data: { title: 'Gestión de Tratamientos' } },
    { path: 'citas', component: Appointment, data: { title: 'Citas Médicas' } },
    { path: 'calendario', component: Calendario, data: { title: 'Calendario de Citas' } }
=======
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'patient', component: Patient },
    { path: 'patient/new', component: NewPatient },
    { path: 'patient/:id', component: PacienteDetail },
    { path: 'tratamientos', component: Tratamientos },
    { path: 'citas', component: Appointment },
    { path: 'calendar', component: Calendar }
>>>>>>> fd71c576082ab4b1fb0aa4e7908b4ff1e3689619
];
