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

export interface ToothState {
  sections: { [key: string]: string };
  sectionNotes?: { [key: string]: string };
  pathologyTypes?: { [key: string]: string };
  absent: boolean;
  note?: string;
  treatmentTypes?: { [key: string]: string };

}

export interface Tratamiento {
  titulo: string;
  precio: number;
  fecha: string;
  doctor: string;
  descripcion: string;
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
  appointments?: any[];
  odontogram?: OdontogramData;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  updateToothAbsence(patientId: number, modalDiente: number, absent: boolean): Observable<void> {
    const url = `${this.apiUrl}/${patientId}/teeth/${modalDiente}/absence`;
    return this.http.put<void>(url, { absent }).pipe(
      tap(() => console.log(`Estado de ausencia actualizado para el diente ${modalDiente} del paciente ${patientId}`)),
      catchError(error => {
        console.error(`Error al actualizar el estado de ausencia para el diente ${modalDiente} del paciente ${patientId}`, error);
        return throwError(() => error);
      })
    );
  }
  private apiUrl = 'http://localhost:8000/api/patients';
  private http = inject(HttpClient);


  private odontogramUpdateSubject = new Subject<{ patientId: number, data: OdontogramData }>();

  constructor() {
    this.odontogramUpdateSubject.pipe(
      debounceTime(500),
      switchMap(({ patientId, data }) =>
        this.http.put<PatientData>(`${this.apiUrl}/${patientId}`, { odontogram: data }).pipe(
          tap(() => console.log(`Odontograma guardado correctamente para el paciente ${patientId}`)),
          catchError(error => {
            console.error(`Error al guardar el odontograma para el paciente ${patientId}`, error);
            return [];
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
