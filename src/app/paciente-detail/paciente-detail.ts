import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PatientService, PatientData } from '../services/patient.service';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css'
})
export class PacienteDetail implements OnInit {
  patient: PatientData | undefined;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patient = this.patientService.getPatientById(id);
  }
}
