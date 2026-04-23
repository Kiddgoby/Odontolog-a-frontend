import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, Subject, debounceTime, switchMap, tap } from 'rxjs';

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
  sectionNotes?: { [key: string]: string }; // section index -> note
  absent: boolean;
  note?: string;
}

export interface OdontogramData {
  notes?: string;
  teeth: { [toothNumber: number]: ToothState };
}

export interface PatientData {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  nationalId?: string;
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
  private apiUrl = 'http://localhost:8000/api/patients';
  private http = inject(HttpClient);

  // Subject para manejar las actualizaciones del odontograma con debounce
  private odontogramUpdateSubject = new Subject<{ patientId: number, data: OdontogramData }>();

  constructor() {
    // Configurar el pipe para procesar las actualizaciones
    this.odontogramUpdateSubject.pipe(
      debounceTime(500), // Esperar 500ms de calma antes de enviar
      switchMap(({ patientId, data }) =>
        this.http.put<PatientData>(`${this.apiUrl}/${patientId}`, { odontogram: data }).pipe(
          tap(() => console.log(`Odontograma guardado correctamente para el paciente ${patientId}`)),
          catchError(error => {
            console.error(`Error al guardar el odontograma para el paciente ${patientId}`, error);
            return []; // Continuar aunque haya error
          })
        )
      )
    ).subscribe();
  }

  getPatients(): Observable<PatientData[]> {
    return this.http.get<PatientData[] | { data: PatientData[] }>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
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
    return this.http.post<PatientData>(this.apiUrl, patient);
  }

  updateOdontogram(patientId: number, data: OdontogramData): void {
    // En lugar de hacer el PUT directo, lo pasamos por el Subject
    this.odontogramUpdateSubject.next({ patientId, data });
  }

  saveOdontogramImmediately(patientId: number, data: OdontogramData): Observable<PatientData> {
    return this.http.put<PatientData>(`${this.apiUrl}/${patientId}`, { odontogram: data }).pipe(
      tap(() => console.log(`Odontograma guardado inmediatamente para el paciente ${patientId}`)),
      catchError(error => {
        console.error(`Error al guardar inmediatamente el odontograma para el paciente ${patientId}`, error);
        return throwError(() => error);
      })
    );
  }
}
