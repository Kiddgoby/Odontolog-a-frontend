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

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.patients = this.patientService.getPatients();
  }

  get filteredPatients() {
    if (!this.searchText) {
      return this.patients;
    }
    const search = this.searchText.toLowerCase();
    return this.patients.filter(p =>
      (p.nombre?.toLowerCase().includes(search) || false) ||
      (p.email?.toLowerCase().includes(search) || false) ||
      (p.phone?.includes(search) || false)
    );
  }

  openNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = true;
  }

  closeNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = false;
  }
}
