import { Injectable } from '@angular/core';

export interface PatientData {
  id: number;
  nombre: string;
  edad: number;
  phone: string;
  email: string;
  ultimaVisita: string;
  proximaCita: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: PatientData[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      edad: 45,
      phone: '600 123 456',
      email: 'juan.perez@email.com',
      ultimaVisita: '15/02/2026',
      proximaCita: '22/03/2026',
      estado: 'activo'
    },
    {
      id: 2,
      nombre: 'María García',
      edad: 32,
      phone: '600 987 654',
      email: 'maria.garcia@email.com',
      ultimaVisita: '10/01/2026',
      proximaCita: '10/07/2026',
      estado: 'pendiente'
    },
    {
      id: 3,
      nombre: 'Carlos López',
      edad: 28,
      phone: '611 222 333',
      email: 'carlos.lopez@email.com',
      ultimaVisita: '01/02/2026',
      proximaCita: '01/08/2026',
      estado: 'activo'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      edad: 55,
      phone: '655 444 333',
      email: 'ana.rod@email.com',
      ultimaVisita: '20/02/2026',
      proximaCita: '20/03/2026',
      estado: 'urgente'
    }
  ];

  constructor() { }

  getPatients(): PatientData[] {
    return this.patients;
  }

  getPatientById(id: number): PatientData | undefined {
    return this.patients.find(p => p.id === id);
  }

  addPatient(patient: any): void {
    const newPatient: PatientData = {
      ...patient,
      id: this.patients.length + 1,
      nombre: `${patient.first_name} ${patient.last_name}`,
      ultimaVisita: '-',
      proximaCita: '-',
      estado: 'activo'
    };
    this.patients.push(newPatient);
  }
}
