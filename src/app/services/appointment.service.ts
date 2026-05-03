import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface AppointmentData {
  id: number;
  fecha: string;
  hora: string;
  paciente: string;
  tratamiento: string;
  doctor: string;
  box?: string;
  duracion: string;
  estado: 'confirmada' | 'pendiente' | 'completada';
  asistido: 'sí' | 'no' | 'pendiente';
  patient_id?: number;
  dentist_id?: number;
  treatment_id?: number;
  box_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8000/api/appointments';
  private http = inject(HttpClient);

  constructor() { }

  private getDataArray(response: AppointmentData[] | { data: AppointmentData[] }): AppointmentData[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  getAppointments(): Observable<AppointmentData[]> {
    console.log(`AppointmentService: GET ${this.apiUrl}`);
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const rawArray = Array.isArray(response) ? response : (response?.data ?? []);
        return rawArray.map((item: any) => this.mapBackendAppointment(item));
      }),
      catchError(error => {
        console.error('AppointmentService getAppointments error', error);
        return throwError(() => error);
      })
    );
  }

  private mapBackendAppointment(raw: any): AppointmentData {
    // Extraer fecha y hora de visitDate si existe
    let fecha = '';
    let hora = '';
    if (raw.visitDate) {
      const visitDate = new Date(raw.visitDate);
      fecha = visitDate.toISOString().split('T')[0];
      hora = visitDate.toTimeString().substring(0, 5);
    } else {
      fecha = raw.fecha || '';
      hora = raw.hora || '';
    }

    // Extraer nombres con múltiples fallbacks
    const paciente = raw.patient_name || raw.paciente || 
                     (raw.patient ? `${raw.patient?.firstName || ''} ${raw.patient?.lastName || ''}`.trim() : '') ||
                     'Paciente';
    
    const tratamiento = raw.treatment_name || raw.tratamiento || raw.consultationReason ||
                        (raw.treatment ? raw.treatment?.treatmentName || raw.treatment?.name : '') ||
                        'Tratamiento';
    
    const doctor = raw.dentist_name || raw.doctor ||
                   (raw.dentist ? `${raw.dentist?.firstName || ''} ${raw.dentist?.lastName || ''}`.trim() : '') ||
                   'Doctor';
    
    const box = raw.box_name || raw.box || 
                (raw.box ? raw.box?.name || raw.box?.number : '') || '';

    // Normalizar estado
    let estado: 'confirmada' | 'pendiente' | 'completada' = 'pendiente';
    const estadoRaw = (raw.estado || raw.status || 'pendiente').toString().toLowerCase();
    if (estadoRaw === 'confirmado' || estadoRaw === 'confirmada') estado = 'confirmada';
    if (estadoRaw === 'completado' || estadoRaw === 'completada') estado = 'completada';

    // Normalizar asistencia
    let asistido: 'sí' | 'no' | 'pendiente' = 'pendiente';
    const asistidoRaw = (raw.asistido || raw.attended || 'pendiente').toString().toLowerCase();
    if (asistidoRaw === 'si' || asistidoRaw === 'sí') asistido = 'sí';
    if (asistidoRaw === 'no') asistido = 'no';

    return {
      id: Number(raw.id) || 0,
      fecha: fecha || 'Sin fecha',
      hora: hora || 'Sin hora',
      paciente: paciente,
      tratamiento: tratamiento,
      doctor: doctor,
      box: box,
      duracion: raw.duration || raw.duracion || '30 min',
      estado: estado,
      asistido: asistido,
      patient_id: raw.patient?.id || raw.patientId,
      dentist_id: raw.dentist?.id || raw.dentistId,
      treatment_id: raw.treatment?.id || raw.treatmentId,
      box_id: raw.box?.id || raw.boxId
    };
  }

  getAppointment(id: number): Observable<AppointmentData> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(raw => this.mapBackendAppointment(raw)),
      catchError(error => {
        console.error('AppointmentService getAppointment error', error);
        return throwError(() => error);
      })
    );
  }

  addAppointment(data: any): Observable<AppointmentData> {
    // Combine fecha and hora into visitDate format expected by Symfony (\DateTime)
    // Format: YYYY-MM-DD HH:mm:ss
    const visitDateStr = `${data.fecha} ${data.hora}:00`;

    const payload = {
      patientId: data.patient_id || data.patientId,
      dentistId: data.dentist_id || data.dentistId,
      treatmentId: data.treatment_id || data.treatmentId,
      boxId: data.box_id || data.boxId || 1,
      visitDate: visitDateStr,
      consultationReason: data.tratamiento,
      estado: 'pendiente',
      asistido: 'pendiente',
      duracion: '30 min'
    };
    
    console.log('AppointmentService: sending payload', payload);

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(raw => this.mapBackendAppointment(raw)),
      catchError(error => {
        console.error('AppointmentService addAppointment error', error);
        return throwError(() => error);
      })
    );
  }

  updateAppointmentStatus(id: number, status: 'confirmada' | 'pendiente' | 'completada'): Observable<AppointmentData> {
    return this.http.patch<AppointmentData>(`${this.apiUrl}/${id}`, { estado: status }).pipe(
      catchError(error => {
        console.error('AppointmentService updateAppointmentStatus error', error);
        return throwError(() => error);
      })
    );
  }

  updateAppointmentTime(id: number, time: string): Observable<AppointmentData> {
    return this.http.patch<AppointmentData>(`${this.apiUrl}/${id}`, { hora: time }).pipe(
      catchError(error => {
        console.error('AppointmentService updateAppointmentTime error', error);
        return throwError(() => error);
      })
    );
  }

  updateAppointmentAttendance(id: number, asistido: 'sí' | 'no' | 'pendiente'): Observable<AppointmentData> {
    return this.http.patch<AppointmentData>(`${this.apiUrl}/${id}`, { asistido }).pipe(
      catchError(error => {
        console.error('AppointmentService updateAppointmentAttendance error', error);
        return throwError(() => error);
      })
    );
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('AppointmentService deleteAppointment error', error);
        return throwError(() => error);
      })
    );
  }
}

