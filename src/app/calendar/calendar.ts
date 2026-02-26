import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService, AppointmentData } from '../services/appointment.service';
import { NewAppointment } from '../new-appointment/new-appointment';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: AppointmentData[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NewAppointment],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  currentDate: Date = new Date();
  days: CalendarDay[] = [];
  weekDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  showNewAppointmentModal: boolean = false;
  selectedDateForNewAppointment: string = '';
  hours: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    // Get the start of the current week (Monday)
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const day = this.currentDate.getDate();

    const dateCopy = new Date(year, month, day);
    let dayOfWeek = dateCopy.getDay();
    // Adjust to Monday start (0=Sun, 1=Mon...6=Sat)
    let diff = dateCopy.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(dateCopy.setDate(diff));

    this.days = [];
    const allAppointments = this.appointmentService.getAppointments();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
      const isToday = this.isSameDay(date, new Date());

      const dayAppointments = allAppointments.filter(app => this.isAppointmentOnDay(app, date));

      this.days.push({
        date,
        isCurrentMonth: true, // In weekly view, all are "current" for our purposes
        isToday,
        appointments: dayAppointments
      });
    }
  }

  isAppointmentOnDay(app: AppointmentData, date: Date): boolean {
    if (!app.fecha) return false;

    // Handle YYYY-MM-DD
    if (app.fecha.includes('-')) {
      const [y, m, d] = app.fecha.split('-').map(Number);
      return d === date.getDate() && (m - 1) === date.getMonth() && y === date.getFullYear();
    }

    // Handle D/M/YYYY
    if (app.fecha.includes('/')) {
      const [d, m, y] = app.fecha.split('/').map(Number);
      return d === date.getDate() && (m - 1) === date.getMonth() && y === date.getFullYear();
    }

    return false;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  prevWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateCalendar();
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateCalendar();
  }

  getWeekRange(): string {
    const start = this.days[0]?.date;
    const end = this.days[6]?.date;
    if (!start || !end) return '';

    const formatMonth = new Intl.DateTimeFormat('es-ES', { month: 'short' });
    const formatYear = new Intl.DateTimeFormat('es-ES', { year: 'numeric' });

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${formatMonth.format(start)} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${formatMonth.format(start)} - ${end.getDate()} ${formatMonth.format(end)} ${start.getFullYear()}`;
  }

  getMonthName(): string {
    return this.getWeekRange();
  }

  openNewAppointment(date?: Date): void {
    if (date) {
      // Format as YYYY-MM-DD for the input type="date"
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      this.selectedDateForNewAppointment = `${y}-${m}-${d}`;
    } else {
      this.selectedDateForNewAppointment = '';
    }
    this.showNewAppointmentModal = true;
  }

  closeNewAppointment(): void {
    this.showNewAppointmentModal = false;
  }

  onAppointmentCreated(): void {
    this.generateCalendar();
    this.closeNewAppointment();
  }

  getAppointmentTop(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 8;
    const hourHeight = 60; // Should match row height in CSS
    const top = (hours - startHour) * hourHeight + (minutes / 60) * hourHeight;
    return `${top}px`;
  }
}
