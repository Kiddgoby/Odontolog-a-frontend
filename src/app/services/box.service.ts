import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, of } from 'rxjs';

export interface BoxData {
  id: number;
  name: string;
  number: string;
  location?: string;
  capacity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private apiUrl = 'http://localhost:8000/api/boxes';
  private http = inject(HttpClient);

  constructor() { }

  getBoxes(): Observable<BoxData[]> {
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
        console.error('BoxService: error en getBoxes', error);
        // En caso de error, devolver un box por defecto
        return of([{ id: 1, name: 'Consultorio 1', number: '1' }]);
      })
    );
  }

  getBoxById(id: number): Observable<BoxData> {
    return this.http.get<BoxData>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`BoxService: error al obtener el box ${id}`, error);
        return throwError(() => error);
      })
    );
  }
}
