import { Injectable } from '@angular/core';

export interface AppointmentData {
  id: number;
  fecha: string;
  hora: string;
  paciente: string;
  tratamiento: string;
  doctor: string;
  duracion: string;
  estado: 'confirmada' | 'pendiente' | 'completada';
  asistido: 'sí' | 'no' | 'pendiente';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: AppointmentData[] = [
    {
      id: 1,
      fecha: '4/2/2024',
      hora: '09:00',
      paciente: 'María García',
      tratamiento: 'Limpieza dental',
      doctor: 'Dr. Rodríguez',
      duracion: '30 min',
      estado: 'confirmada',
      asistido: 'pendiente'
    },
    {
      id: 2,
      fecha: '4/2/2024',
      hora: '10:30',
      paciente: 'Carlos Fernández',
      tratamiento: 'Ortodoncia - Revisión',
      doctor: 'Dra. Martínez',
      duracion: '45 min',
      estado: 'confirmada',
      asistido: 'pendiente'
    },
    {
      id: 3,
      fecha: '4/2/2024',
      hora: '11:00',
      paciente: 'Ana López',
      tratamiento: 'Extracción',
      doctor: 'Dr. Rodríguez',
      duracion: '60 min',
      estado: 'pendiente',
      asistido: 'pendiente'
    },
    {
      id: 4,
      fecha: '5/2/2024',
      hora: '14:00',
      paciente: 'Juan Pérez',
      tratamiento: 'Implante dental',
      doctor: 'Dr. Sánchez',
      duracion: '90 min',
      estado: 'confirmada',
      asistido: 'pendiente'
    },
    {
      id: 5,
      fecha: '5/2/2024',
      hora: '15:30',
      paciente: 'Laura Ruiz',
      tratamiento: 'Blanqueamiento',
      doctor: 'Dra. Martínez',
      duracion: '60 min',
      estado: 'pendiente',
      asistido: 'pendiente'
    },
    {
      id: 6,
      fecha: '6/2/2024',
      hora: '09:30',
      paciente: 'Pedro Sánchez',
      tratamiento: 'Revisión general',
      doctor: 'Dr. Rodríguez',
      duracion: '30 min',
      estado: 'confirmada',
      asistido: 'pendiente'
    },
    {
      id: 7,
      fecha: '6/2/2024',
      hora: '11:00',
      paciente: 'Isabel Torres',
      tratamiento: 'Endodoncia',
      doctor: 'Dr. Sánchez',
      duracion: '120 min',
      estado: 'confirmada',
      asistido: 'pendiente'
    }
  ];

  constructor() { }

  getAppointments(): AppointmentData[] {
    return this.appointments;
  }

  updateAppointmentStatus(id: number, status: 'confirmada' | 'pendiente' | 'completada'): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.estado = status;
    }
  }

  addAppointment(data: Omit<AppointmentData, 'id' | 'estado' | 'asistido' | 'duracion'>): void {
    const newId = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
    const newAppointment: AppointmentData = {
      ...data,
      id: newId,
      estado: 'pendiente',
      asistido: 'pendiente',
      duracion: '30 min' // Default duration or could be passed
    };
    this.appointments.push(newAppointment);
  }

  deleteAppointment(id: number): void {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments.splice(index, 1);
    }
  }

  updateAppointmentTime(id: number, time: string): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.hora = time;
    }
  }

  updateAppointmentAttendance(id: number, asistido: 'sí' | 'no' | 'pendiente'): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.asistido = asistido;
    }
  }
}
