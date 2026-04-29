import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface DentistData {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  availableDays: string;
  phone: string;
  email: string;
  boxId?: number;
  box?: any;
  treatmentId?: number;
  treatment?: any;
}


@Injectable({
  providedIn: 'root'
})
export class DentistService {
  private apiUrl = 'http://localhost:8000/api/dentists';
  private http = inject(HttpClient);

  constructor() { }

  getDentists(): Observable<DentistData[]> {
    return this.http.get<any>(this.apiUrl).pipe(
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
        console.error('DentistService: error en getDentists', error);
        return throwError(() => error);
      })
    );
  }

  getDentistById(id: number): Observable<DentistData> {
    return this.http.get<DentistData>(`${this.apiUrl}/${id}`);
  }

  getDentistTreatments(dentistId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${dentistId}/treatments`).pipe(
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
        console.error(`DentistService: error al obtener tratamientos del dentista ${dentistId}`, error);
        return throwError(() => error);
      })
    );
  }
}
