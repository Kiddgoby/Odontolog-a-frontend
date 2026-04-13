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
    this.appointmentService.getAppointments().subscribe({
      next: appointments => {
        this.appointments = appointments;
      },
      error: err => {
        console.error('Error cargando citas', err);
      }
    });
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
      this.appointmentService.updateAppointmentStatus(this.selectedAppointment.id, status).subscribe({
        next: () => {
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error actualizando estado', err)
      });
    }
  }

  updateTime(): void {
    if (this.selectedAppointment && this.newTime) {
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime).subscribe({
        next: () => {
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error actualizando hora', err)
      });
    }
  }

  saveChanges(): void {
    if (this.selectedAppointment) {
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime).subscribe({
        next: () => {
          this.appointmentService.updateAppointmentAttendance(this.selectedAppointment!.id, this.asistencia).subscribe({
            next: () => {
              this.loadAppointments();
              this.closePopup();
            },
            error: err => console.error('Error actualizando asistencia', err)
          });
        },
        error: err => console.error('Error guardando cambios de hora', err)
      });
    }
  }

  markAsAbsent(): void {
    if (this.selectedAppointment) {
      this.appointmentService.deleteAppointment(this.selectedAppointment.id).subscribe({
        next: () => {
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error eliminando cita', err)
      });
    }
  }
}
