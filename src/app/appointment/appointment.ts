import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, AppointmentData } from '../services/appointment.service';
import { NewAppointment } from '../new-appointment/new-appointment';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, NewAppointment],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css',
})
export class Appointment implements OnInit {
  appointments: AppointmentData[] = [];
  searchText: string = '';
  currentFilter: string = 'Todas';
  selectedAppointment: AppointmentData | null = null;
  isPopupOpen: boolean = false;
  isNewAppointmentModalOpen: boolean = false;
  newTime: string = '';
  asistencia: 'sí' | 'no' | 'pendiente' = 'pendiente';

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointments = this.appointmentService.getAppointments();
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  get filteredAppointments(): AppointmentData[] {
    let filtered = this.appointments;

    // Filter by status
    if (this.currentFilter !== 'Todas') {
      filtered = filtered.filter(a => a.estado.toLowerCase() === this.currentFilter.toLowerCase().slice(0, -1) ||
        (this.currentFilter === 'Confirmadas' && a.estado === 'confirmada') ||
        (this.currentFilter === 'Pendientes' && a.estado === 'pendiente') ||
        (this.currentFilter === 'Completadas' && a.estado === 'completada'));
    }

    // Filter by search text
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(a =>
        a.paciente.toLowerCase().includes(search) ||
        a.tratamiento.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  openPopup(appointment: AppointmentData): void {
    this.selectedAppointment = { ...appointment };
    this.newTime = appointment.hora;
    this.asistencia = appointment.asistido;
    this.isPopupOpen = true;
  }

  openNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = true;
  }

  closeNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = false;
    this.loadAppointments();
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.selectedAppointment = null;
  }

  updateStatus(status: 'confirmada' | 'pendiente' | 'completada'): void {
    if (this.selectedAppointment) {
      this.appointmentService.updateAppointmentStatus(this.selectedAppointment.id, status);
      this.loadAppointments();
      this.closePopup();
    }
  }

  updateTime(): void {
    if (this.selectedAppointment && this.newTime) {
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime);
      this.loadAppointments();
      this.closePopup();
    }
  }

  saveChanges(): void {
    if (this.selectedAppointment) {
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime);
      this.appointmentService.updateAppointmentAttendance(this.selectedAppointment.id, this.asistencia);
      this.loadAppointments();
      this.closePopup();
    }
  }

  markAsAbsent(): void {
    if (this.selectedAppointment) {
      this.appointmentService.deleteAppointment(this.selectedAppointment.id);
      this.loadAppointments();
      this.closePopup();
    }
  }
}
