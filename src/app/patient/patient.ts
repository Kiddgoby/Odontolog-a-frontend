import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService, PatientData } from '../services/patient.service';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient.html',
  styleUrl: './patient.css',
})
export class Patient implements OnInit {
  searchText: string = '';
  patients: PatientData[] = [];

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
}
