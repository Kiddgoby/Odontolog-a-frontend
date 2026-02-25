import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PatientService, PatientData } from '../services/patient.service';
import { NewAppointment } from '../new-appointment/new-appointment';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NewAppointment], // Importado correctamente para su uso en el template
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css'
})
export class PacienteDetail implements OnInit {
  patient: PatientData | undefined;
  isNewAppointmentModalOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.loadPatient();
  }

  loadPatient(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patient = this.patientService.getPatientById(id);
  }

  openNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = true;
  }

  closeNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = false;
    this.loadPatient(); // Refresh data if needed
  }
}
