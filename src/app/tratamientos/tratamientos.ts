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
  loading = false;
  error: string | null = null;

  // Estado del formulario
  showForm = false;
  isEditing = false;
  currentTratamiento: Tratamiento = this.getEmptyTratamiento();

  ngOnInit() {
    this.cargarTratamientos();
  }

  cargarTratamientos() {
    this.loading = true;
    this.error = null;

    this.treatmentService.getTratamientos().subscribe({
      next: data => {
        this.tratamientos = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando tratamientos:', err);
        this.error = 'No se pudieron cargar los tratamientos desde el backend.';
        this.loading = false;
      }
    });
  }

  get tratamientosFiltrados(): Tratamiento[] {
    return this.tratamientos.filter(t => {
      const nombreField = (t as any).nombre || t.name || t.treatmentName || '';
      const descripcionField = (t as any).descripcion || t.description || '';
      const categoriaField = (t as any).categoria || t.categoria || '';
      const matchSearch = (
        nombreField.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        descripcionField.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const matchCategory = this.selectedCategory === 'Todos' || categoriaField === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  getEmptyTratamiento(): Tratamiento {
    return {
      id: 0,
      name: '',
      treatmentName: '',
      description: '',
      categoria: 'Preventiva',
      duracion: 30,
      precio: 0,
      nombre: '',
      descripcion: ''
    } as any;
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
    const payload = {
      treatmentName: (this.currentTratamiento as any).nombre || this.currentTratamiento.name,
      description: (this.currentTratamiento as any).descripcion || this.currentTratamiento.description,
      categoria: (this.currentTratamiento as any).categoria,
      duracion: this.currentTratamiento.duracion,
      precio: this.currentTratamiento.precio
    };

    if (this.isEditing) {
      this.treatmentService.updateTratamiento({ ...this.currentTratamiento, ...payload }).subscribe({
        next: () => this.cargarTratamientos(),
        error: err => {
          console.error('Error actualizando tratamiento:', err);
          this.error = 'No se pudo actualizar el tratamiento en el backend.';
        }
      });
    } else {
      this.treatmentService.addTratamiento(payload).subscribe({
        next: () => this.cargarTratamientos(),
        error: err => {
          console.error('Error guardando tratamiento:', err);
          this.error = 'No se pudo guardar el tratamiento en el backend.';
        }
      });
    }

  }

  editar(tratamiento: Tratamiento) {
    this.abrirFormulario(tratamiento);
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      this.treatmentService.deleteTratamiento(id).subscribe({
        next: () => {
          this.cargarTratamientos();
        },
        error: err => {
          console.error('Error eliminando tratamiento:', err);
          this.error = 'No se pudo eliminar el tratamiento en el backend.';
        }
      });
    }
  }
}
