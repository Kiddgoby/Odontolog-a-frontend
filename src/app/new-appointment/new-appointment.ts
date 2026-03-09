import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { TreatmentService, Tratamiento } from '../services/treatment.service';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-appointment.html',
  styleUrl: './new-appointment.css',
})
export class NewAppointment implements OnInit {
  @Input() initialDate: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  appointmentData = {
    paciente: '',
    doctor: '',
    fecha: '',
    hora: '',
    tratamiento: ''
  };

  doctors = ['Dr. Rodríguez', 'Dra. Martínez', 'Dr. Sánchez'];
  allTreatments: Tratamiento[] = [];
  filteredTreatments: Tratamiento[] = [];
  showSuggestions: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private treatmentService: TreatmentService
  ) { }

  ngOnInit(): void {
    this.allTreatments = this.treatmentService.getTratamientos();
    if (this.initialDate) {
      this.appointmentData.fecha = this.initialDate;
    }
  }

  onTreatmentInput(): void {
    if (this.appointmentData.tratamiento) {
      const search = this.appointmentData.tratamiento.toLowerCase();
      this.filteredTreatments = this.allTreatments.filter(t =>
        t.nombre.toLowerCase().includes(search)
      );
      this.showSuggestions = this.filteredTreatments.length > 0;
    } else {
      this.filteredTreatments = [];
      this.showSuggestions = false;
    }
  }

  selectTreatment(treatment: Tratamiento): void {
    this.appointmentData.tratamiento = treatment.nombre;
    this.showSuggestions = false;
  }

  hideSuggestions(): void {
    // Timeout to allow click event on suggestion to fire before hiding
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onSubmit(): void {
    if (this.appointmentData.paciente && this.appointmentData.doctor && this.appointmentData.fecha && this.appointmentData.hora) {
      this.appointmentService.addAppointment(this.appointmentData);
      this.created.emit();
      this.close.emit();
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
