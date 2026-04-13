import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface Tratamiento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  duracion: number;
  precio: number;
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
        const rawArray = Array.isArray(response) ? response : (response?.data ?? []);
        return rawArray.map((raw: any) => ({
          id: raw.id,
          nombre: raw.treatmentName || raw.nombre,
          descripcion: raw.description,
          categoria: raw.categoria || 'Dental',
          duracion: raw.duracion || 30,
          precio: raw.precio || 0
        }));
      }),
      catchError(error => {
        console.error('TreatmentService: error en getTratamientos', error);
        return throwError(() => error);
      })
    );
  }

  addTratamiento(tratamiento: Omit<Tratamiento, 'id'>): Observable<Tratamiento> {
    const payload = {
      treatmentName: tratamiento.nombre,
      description: tratamiento.descripcion,
      categoria: tratamiento.categoria,
      duracion: tratamiento.duracion,
      precio: tratamiento.precio
    };
    return this.http.post<Tratamiento>(this.apiUrl, payload);
  }

  updateTratamiento(tratamiento: Tratamiento): Observable<Tratamiento> {
    const payload = {
      treatmentName: tratamiento.nombre,
      description: tratamiento.descripcion,
      categoria: tratamiento.categoria,
      duracion: tratamiento.duracion,
      precio: tratamiento.precio
    };
    return this.http.put<Tratamiento>(`${this.apiUrl}/${tratamiento.id}`, payload);
  }

  deleteTratamiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
