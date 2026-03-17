import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  titulo: string;
  fecha: string;
  hora: string;
  doctor: string;
  estado: string;
}

export interface Tratamiento {
  titulo: string;
  precio: number;
  fecha: string;
  doctor: string;
  descripcion: string;
}

export interface ToothState {
  sections: { [key: string]: string }; // section index -> hex color
  absent: boolean;
}

export interface OdontogramData {
  notes?: string;
  teeth: { [toothNumber: number]: ToothState };
}

export interface PatientData {
  id: number;
  firstName: string;
  lastName: string;
  edad?: number;
  registrationDate?: string;
  phone: string;
  email: string;
  address: string;
  medicationAllergies: string;
  billingData: string;
  healthStatus: string;
  familyHistory: string;
  lifestyleHabits?: string;
  ultimaVisita?: string;
  proximaCita?: string;
  estado?: string;
  citas?: Cita[];
  tratamientos?: Tratamiento[];
  appointments?: any[]; // For the actual backend response
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8000/api/patients';
  private http = inject(HttpClient);

  constructor() { }

  getPatients(): Observable<PatientData[]> {
    console.log(`PatientService: Realizando GET a ${this.apiUrl}`);
    return this.http.get<PatientData[]>(this.apiUrl);
  }

  getPatientById(id: number): Observable<PatientData> {
    return this.http.get<PatientData>(`${this.apiUrl}/${id}`);
  }

  addPatient(patient: any): Observable<PatientData> {
    console.log(`PatientService: Realizando POST a ${this.apiUrl}`, patient);
    return this.http.post<PatientData>(this.apiUrl, patient);
  }

  updateOdontogram(patientId: number, data: OdontogramData): void {
    const patient = this.getPatientById(patientId);
    if (patient) {
      patient.odontogram = data;
      console.log(`Odontograma actualizado para el paciente ${patientId}`, data);
    }
  }
}
