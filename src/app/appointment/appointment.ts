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
    console.log(' Iniciando carga de citas...');
    this.appointmentService.getAppointments().subscribe({
      next: appointments => {
        console.log(' Citas recibidas en componente:', appointments);
        console.log(' Número de citas:', appointments.length);
        console.log(' Es array:', Array.isArray(appointments));
        
        this.appointments = appointments;
        console.log(' Appointments asignados:', this.appointments);
        
        // Verificar el getter filteredAppointments
        console.log(' filteredAppointments:', this.filteredAppointments);
      },
      error: err => {
        console.error(' Error cargando citas', err);
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
    console.log('DEBUG: openPopup llamado con appointment:', appointment);
    console.log('DEBUG: appointment.hora:', appointment.hora);
    console.log('DEBUG: appointment.asistido:', appointment.asistido);
    
    this.selectedAppointment = { ...appointment };
    this.newTime = appointment.hora || '';
    this.asistencia = appointment.asistido || 'pendiente';
    
    console.log('DEBUG: selectedAppointment asignado:', this.selectedAppointment);
    console.log('DEBUG: isPopupOpen antes:', this.isPopupOpen);
    
    this.isPopupOpen = true;
    
    console.log('DEBUG: isPopupOpen después:', this.isPopupOpen);
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
    console.log('DEBUG: updateStatus llamado con status:', status);
    console.log('DEBUG: selectedAppointment:', this.selectedAppointment);
    
    if (this.selectedAppointment) {
      console.log('DEBUG: Enviando updateAppointmentStatus para ID:', this.selectedAppointment.id);
      this.appointmentService.updateAppointmentStatus(this.selectedAppointment.id, status).subscribe({
        next: () => {
          console.log('DEBUG: updateAppointmentStatus completado exitosamente');
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error actualizando estado', err)
      });
    } else {
      console.log('DEBUG: No hay selectedAppointment para updateStatus');
    }
  }

  updateTime(): void {
    console.log('DEBUG: updateTime llamado');
    console.log('DEBUG: selectedAppointment:', this.selectedAppointment);
    console.log('DEBUG: newTime:', this.newTime);
    
    if (this.selectedAppointment && this.newTime) {
      console.log('DEBUG: Enviando updateAppointmentTime para ID:', this.selectedAppointment.id, 'con hora:', this.newTime);
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime).subscribe({
        next: () => {
          console.log('DEBUG: updateAppointmentTime completado exitosamente');
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error actualizando hora', err)
      });
    } else {
      console.log('DEBUG: No hay selectedAppointment o newTime para updateTime');
      console.log('DEBUG: selectedAppointment existe:', !!this.selectedAppointment);
      console.log('DEBUG: newTime existe:', !!this.newTime);
    }
  }

  saveChanges(): void {
    console.log('DEBUG: saveChanges llamado');
    console.log('DEBUG: selectedAppointment:', this.selectedAppointment);
    console.log('DEBUG: newTime:', this.newTime);
    console.log('DEBUG: asistencia:', this.asistencia);
    
    if (this.selectedAppointment) {
      console.log('DEBUG: Enviando updateAppointmentTime para saveChanges');
      this.appointmentService.updateAppointmentTime(this.selectedAppointment.id, this.newTime).subscribe({
        next: () => {
          console.log('DEBUG: updateAppointmentTime completado, enviando updateAppointmentAttendance');
          this.appointmentService.updateAppointmentAttendance(this.selectedAppointment!.id, this.asistencia).subscribe({
            next: () => {
              console.log('DEBUG: saveChanges completado exitosamente');
              this.loadAppointments();
              this.closePopup();
            },
            error: err => console.error('Error actualizando asistencia', err)
          });
        },
        error: err => console.error('Error guardando cambios de hora', err)
      });
    } else {
      console.log('DEBUG: No hay selectedAppointment para saveChanges');
    }
  }

  markAsAbsent(): void {
    console.log('DEBUG: markAsAbsent llamado');
    console.log('DEBUG: selectedAppointment:', this.selectedAppointment);
    
    if (this.selectedAppointment) {
      console.log('DEBUG: Enviando deleteAppointment para ID:', this.selectedAppointment.id);
      this.appointmentService.deleteAppointment(this.selectedAppointment.id).subscribe({
        next: () => {
          console.log('DEBUG: deleteAppointment completado exitosamente');
          this.loadAppointments();
          this.closePopup();
        },
        error: err => console.error('Error eliminando cita', err)
      });
    } else {
      console.log('DEBUG: No hay selectedAppointment para markAsAbsent');
    }
  }
}
