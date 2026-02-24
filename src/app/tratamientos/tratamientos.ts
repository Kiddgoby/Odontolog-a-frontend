import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Tratamiento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  duracion: number;
  precio: number;
}

@Component({
  selector: 'app-tratamientos',
  imports: [FormsModule, CommonModule],
  templateUrl: './tratamientos.html',
  styleUrl: './tratamientos.css',
})
export class Tratamientos {
  searchTerm = '';
  selectedCategory = 'Todos';

  categorias = ['Todos', 'Preventiva', 'Ortodoncia', 'Cirugía', 'Estética', 'Conservadora'];

  tratamientos: Tratamiento[] = [
    { id: 1, nombre: 'Limpieza dental', categoria: 'Preventiva', descripcion: 'Limpieza profesional y eliminación de sarro.', duracion: 45, precio: 80 },
    { id: 2, nombre: 'Ortodoncia', categoria: 'Ortodoncia', descripcion: 'Corrección de la posición dental con brackets.', duracion: 60, precio: 150 },
    { id: 3, nombre: 'Blanqueamiento', categoria: 'Estética', descripcion: 'Blanqueamiento dental profesional en clínica.', duracion: 90, precio: 200 },
    { id: 4, nombre: 'Implante dental', categoria: 'Cirugía', descripcion: 'Colocación de implante de titanio.', duracion: 120, precio: 1200 },
    { id: 5, nombre: 'Extracción', categoria: 'Cirugía', descripcion: 'Extracción dental simple o quirúrgica.', duracion: 30, precio: 100 },
  ];

  get tratamientosFiltrados(): Tratamiento[] {
    return this.tratamientos.filter(t => {
      const matchSearch = t.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategory === 'Todos' || t.categoria === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  editar(tratamiento: Tratamiento) {
    // TODO: implementar lógica de edición (modal, formulario, etc.)
    console.log('Editar tratamiento:', tratamiento);
  }

  eliminar(id: number) {
    this.tratamientos = this.tratamientos.filter(t => t.id !== id);
  }
}
