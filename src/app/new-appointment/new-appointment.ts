import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { TreatmentService, Tratamiento } from '../services/treatment.service';
import { PatientService, PatientData } from '../services/patient.service';
import { DentistService, DentistData } from '../services/dentist.service';

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
    patient_id: null as number | null,
    dentist_id: null as number | null,
    treatment_id: null as number | null,
    fecha: '',
    hora: '',
    tratamiento: '' // This will store the reason/name for the backend
  };

  patients: PatientData[] = [];
  doctors: DentistData[] = [];
  allTreatments: Tratamiento[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private treatmentService: TreatmentService,
    private patientService: PatientService,
    private dentistService: DentistService
  ) { }

  ngOnInit(): void {
    this.loadData();
    if (this.initialDate) {
      this.appointmentData.fecha = this.initialDate;
    }
  }

  loadData(): void {
    this.patientService.getPatients().subscribe(data => this.patients = data);
    this.dentistService.getDentists().subscribe(data => this.doctors = data);
    this.treatmentService.getTratamientos().subscribe(data => this.allTreatments = data);
  }

  onTreatmentChange(event: any): void {
    const treatmentId = Number(event.target.value);
    const treatment = this.allTreatments.find(t => t.id === treatmentId);
    if (treatment) {
      this.appointmentData.treatment_id = treatment.id;
      this.appointmentData.tratamiento = treatment.nombre;
    }
  }

  onSubmit(): void {
    if (this.appointmentData.patient_id && this.appointmentData.dentist_id && this.appointmentData.fecha && this.appointmentData.hora) {
      this.appointmentService.addAppointment(this.appointmentData).subscribe({
        next: () => {
          this.created.emit();
          this.close.emit();
        },
        error: err => {
          console.error('Error creando cita', err);
        }
      });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
