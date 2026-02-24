import { Injectable } from '@angular/core';

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

export interface PatientData {
  id: number;
  nombre: string;
  edad: number;
  phone: string;
  email: string;
  address: string;
  medication_allergies: string;
  billing_data: string;
  health_status: string;
  family_history: string;
  ultimaVisita: string;
  proximaCita: string;
  estado: string;
  citas: Cita[];
  tratamientos: Tratamiento[];
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
      address: 'Calle Mayor 123, Madrid',
      medication_allergies: 'Penicilina',
      billing_data: 'Sanitas - 123456789',
      health_status: 'Estable. Requiere limpieza profunda.',
      family_history: 'Diabetes tipo 2 (Padre)',
      ultimaVisita: '15/02/2026',
      proximaCita: '22/03/2026',
      estado: 'activo',
      citas: [
        { titulo: 'Limpieza profunda', fecha: '22/03/2026', hora: '10:00', doctor: 'Dr. Rodríguez', estado: 'confirmada' }
      ],
      tratamientos: [
        { titulo: 'Extracción muela', precio: 120, fecha: '15/02/2026', doctor: 'Dr. Rodríguez', descripcion: 'Extracción sin complicaciones.' }
      ]
    },
    {
      id: 2,
      nombre: 'María García',
      edad: 32,
      phone: '600 987 654',
      email: 'maria.garcia@email.com',
      address: 'Avenida de la Libertad 45, Barcelona',
      medication_allergies: 'Ninguna',
      billing_data: 'Mapfre - BB12345',
      health_status: 'Pendiente de ortodoncia.',
      family_history: 'Ninguno relevante',
      ultimaVisita: '10/01/2026',
      proximaCita: '10/07/2026',
      estado: 'pendiente',
      citas: [],
      tratamientos: []
    },
    {
      id: 3,
      nombre: 'Carlos López',
      edad: 28,
      phone: '611 222 333',
      email: 'carlos.lopez@email.com',
      address: 'Plaza España 1, Sevilla',
      medication_allergies: 'Polen',
      billing_data: 'Seguro Privado',
      health_status: 'Salud dental excelente.',
      family_history: 'Ninguno relevante',
      ultimaVisita: '01/02/2026',
      proximaCita: '01/08/2026',
      estado: 'activo',
      citas: [],
      tratamientos: []
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      edad: 55,
      phone: '655 444 333',
      email: 'ana.rod@email.com',
      address: 'Calle Gran Vía 8, Valencia',
      medication_allergies: 'Látex',
      billing_data: 'Adeslas - 987654',
      health_status: 'Dolor agudo en premolar superior izquierdo.',
      family_history: 'Enfermedad periodontal (Madre)',
      ultimaVisita: '20/02/2026',
      proximaCita: '20/03/2026',
      estado: 'urgente',
      citas: [
        { titulo: 'Urgencia - Dolor agudo', fecha: '20/03/2026', hora: '16:30', doctor: 'Dr. Sánchez', estado: 'pendiente' }
      ],
      tratamientos: []
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
      estado: 'activo',
      citas: [],
      tratamientos: [],
      address: patient.address || '-',
      medication_allergies: patient.medication_allergies || 'Ninguna',
      billing_data: patient.billing_data || '-',
      health_status: patient.health_status || '-',
      family_history: patient.family_history || '-'
    };
    this.patients.push(newPatient);
  }
}
