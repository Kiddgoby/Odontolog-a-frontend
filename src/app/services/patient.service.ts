import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

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
  odontogram?: OdontogramData;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // El backend de desarrollo de Django/Flask está en 8000, no 4200
  private apiUrl = 'http://localhost:8000/api/patients';
  private http = inject(HttpClient);

  constructor() { }

  getPatients(): Observable<PatientData[]> {
    console.log(`PatientService: Realizando GET a ${this.apiUrl}`);
    return this.http.get<PatientData[] | { data: PatientData[] }>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        console.warn('PatientService: respuesta GET no es array ni {data: array}.', response);
        return [];
      }),
      catchError(error => {
        console.error('PatientService: error en getPatients', error);
        return throwError(() => error);
      })
    );
  }

  getPatientById(id: number): Observable<PatientData> {
    return this.http.get<PatientData>(`${this.apiUrl}/${id}`);
  }

  addPatient(patient: any): Observable<PatientData> {
    console.log(`PatientService: Realizando POST a ${this.apiUrl}`, patient);
    return this.http.post<PatientData>(this.apiUrl, patient);
  }

  updateOdontogram(patientId: number, data: OdontogramData): void {
    this.getPatientById(patientId).subscribe(patient => {
      if (patient) {
        patient.odontogram = data;
        this.http.put<PatientData>(`${this.apiUrl}/${patientId}`, patient).subscribe(() => {
          console.log(`Odontograma actualizado para el paciente ${patientId}`, data);
        });
      }
    });
  }
}
