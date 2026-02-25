import { Injectable } from '@angular/core';

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
  private tratamientos: Tratamiento[] = [
    { id: 1, nombre: 'Limpieza dental', categoria: 'Preventiva', descripcion: 'Limpieza profesional y eliminación de sarro.', duracion: 45, precio: 80 },
    { id: 2, nombre: 'Ortodoncia', categoria: 'Ortodoncia', descripcion: 'Corrección de la posición dental con brackets.', duracion: 60, precio: 150 },
    { id: 3, nombre: 'Blanqueamiento', categoria: 'Estética', descripcion: 'Blanqueamiento dental profesional en clínica.', duracion: 90, precio: 200 },
    { id: 4, nombre: 'Implante dental', categoria: 'Cirugía', descripcion: 'Colocación de implante de titanio.', duracion: 120, precio: 1200 },
    { id: 5, nombre: 'Extracción', categoria: 'Cirugía', descripcion: 'Extracción dental simple o quirúrgica.', duracion: 30, precio: 100 },
  ];

  constructor() { }

  getTratamientos(): Tratamiento[] {
    return this.tratamientos;
  }
}
