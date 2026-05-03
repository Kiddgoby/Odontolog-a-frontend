import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService, AppointmentData } from '../services/appointment.service';
import { PatientService } from '../services/patient.service';
import { inject, OnInit } from '@angular/core';

@Component({
  selector: 'home',
  standalone: true,
  imports: [CommonModule, RouterLink],

  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);

  appointments: AppointmentData[] = [];
  totalPatients: number = 0;

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
      },
      error: (err) => console.error('Error loading appointments in dashboard', err)
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.totalPatients = data.length;
      },
      error: (err) => console.error('Error loading patients in dashboard', err)
    });
  }

  get appointmentsToday(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter(a => a.fecha === today).length;
  }

  get totalAppointments(): number {
    return this.appointments.length;
  }

  get pendingAppointments(): number {
    return this.appointments.filter(a => a.estado === 'pendiente').length;
  }

  get todaysAppointmentsList(): AppointmentData[] {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter(a => a.fecha === today);
  }
}
