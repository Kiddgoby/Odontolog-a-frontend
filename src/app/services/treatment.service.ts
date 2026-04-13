import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface Tratamiento {
  id: number;
  name?: string;  // alias del backend para treatmentName
  treatmentName?: string;  // nombre del campo real en el backend
  description?: string;
  categoria?: string;
  duracion?: number;
  precio?: number;
  nombre?: string;  // para el template
  descripcion?: string;  // para el template
}

@Injectable({
  providedIn: 'root'
})
export class TreatmentService {
  private apiUrl = 'http://localhost:8000/api/treatments';
  private http = inject(HttpClient);

  constructor() { }

  getTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          // Mapear los campos del backend al formato esperado por el frontend
          return response.map(item => ({
            id: item.id,
            name: item.name || item.treatmentName,
            treatmentName: item.name || item.treatmentName,
            description: item.description,
            categoria: item.categoria || item.category,
            duracion: item.duracion || item.duration,
            precio: item.precio || item.price,
            nombre: item.name || item.treatmentName,
            descripcion: item.description  // alias para template
          }));
        }
        if (response && 'data' in response && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            id: item.id,
            name: item.name || item.treatmentName,
            treatmentName: item.name || item.treatmentName,
            description: item.description,
            categoria: item.categoria || item.category,
            duracion: item.duracion || item.duration,
            precio: item.precio || item.price,
            nombre: item.name || item.treatmentName,
            descripcion: item.description
          }));
        }
        console.warn('TreatmentService: respuesta GET no es array ni { data: array }.', response);
        return [];
      }),
      catchError(error => {
        console.error('TreatmentService: error en getTratamientos', error);
        return throwError(() => error);
      })
    );
  }

  addTratamiento(tratamiento: Omit<Tratamiento, 'id'>): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(this.apiUrl, tratamiento).pipe(
      catchError(error => {
        console.error('TreatmentService: error en addTratamiento', error);
        return throwError(() => error);
      })
    );
  }

  updateTratamiento(tratamiento: Tratamiento): Observable<Tratamiento> {
    return this.http.put<Tratamiento>(`${this.apiUrl}/${tratamiento.id}`, tratamiento).pipe(
      catchError(error => {
        console.error('TreatmentService: error en updateTratamiento', error);
        return throwError(() => error);
      })
    );
  }

  deleteTratamiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('TreatmentService: error en deleteTratamiento', error);
        return throwError(() => error);
      })
    );
  }
}
