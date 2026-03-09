import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreatmentService, Tratamiento } from '../services/treatment.service';

@Component({
  selector: 'app-tratamientos',
  imports: [FormsModule, CommonModule],
  templateUrl: './tratamientos.html',
  styleUrl: './tratamientos.css',
})
export class Tratamientos implements OnInit {
  private treatmentService = inject(TreatmentService);

  searchTerm = '';
  selectedCategory = 'Todos';
  categorias = ['Todos', 'Preventiva', 'Ortodoncia', 'Cirugía', 'Estética', 'Conservadora'];

  tratamientos: Tratamiento[] = [];

  // Estado del formulario
  showForm = false;
  isEditing = false;
  currentTratamiento: Tratamiento = this.getEmptyTratamiento();

  ngOnInit() {
    this.cargarTratamientos();
  }

  cargarTratamientos() {
    this.tratamientos = this.treatmentService.getTratamientos();
  }

  get tratamientosFiltrados(): Tratamiento[] {
    return this.tratamientos.filter(t => {
      const matchSearch = (t.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchCategory = this.selectedCategory === 'Todos' || t.categoria === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  getEmptyTratamiento(): Tratamiento {
    return {
      id: 0,
      nombre: '',
      categoria: 'Preventiva',
      descripcion: '',
      duracion: 30,
      precio: 0
    };
  }

  abrirFormulario(tratamiento?: Tratamiento) {
    if (tratamiento) {
      this.isEditing = true;
      this.currentTratamiento = { ...tratamiento };
    } else {
      this.isEditing = false;
      this.currentTratamiento = this.getEmptyTratamiento();
    }
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
    this.currentTratamiento = this.getEmptyTratamiento();
  }

  guardar() {
    if (this.isEditing) {
      this.treatmentService.updateTratamiento(this.currentTratamiento);
    } else {
      this.treatmentService.addTratamiento(this.currentTratamiento);
    }
    this.cargarTratamientos();
    this.cerrarFormulario();
  }

  editar(tratamiento: Tratamiento) {
    this.abrirFormulario(tratamiento);
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      this.treatmentService.deleteTratamiento(id);
      this.cargarTratamientos();
    }
  }
}
