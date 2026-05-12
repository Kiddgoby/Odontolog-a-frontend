import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService, PatientData } from '../services/patient.service';
import { NewAppointment } from '../new-appointment/new-appointment';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NewAppointment], // Componente Nueva Cita integrado
  templateUrl: './patient.html',
  styleUrl: './patient.css',
})
export class Patient implements OnInit {
  searchText: string = '';
  patients: PatientData[] = [];
  isNewAppointmentModalOpen: boolean = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.patientService.getPatients().subscribe({
      next: data => {
        this.patients = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Patient: error al cargar pacientes', err);
        this.errorMessage = 'No se pudieron cargar los pacientes. Verifique servidor backend y CORS.';
        this.isLoading = false;
      }
    });
  }

  get filteredPatients() {
    if (!this.searchText) {
      return this.patients;
    }
    const search = this.searchText.toLowerCase();
    return this.patients.filter(p =>
      (p.firstName?.toLowerCase().includes(search) || false) ||
      (p.lastName?.toLowerCase().includes(search) || false) ||
      (p.email?.toLowerCase().includes(search) || false) ||
      (p.phone?.includes(search) || false)
    );
  }

  isDangerousPatient(patient: PatientData): boolean {
    const fields = [
      patient.medicationAllergies,
      patient.healthStatus,
      patient.familyHistory,
      patient.lifestyleHabits,
    ];
    return fields.some(value => typeof value === 'string' && value.trim().length > 0);
  }

  openNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = true;
  }

  closeNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = false;
  }
}
