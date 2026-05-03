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
  selectedCategory = 'Tots';
  categorias = ['Tots', 'Preventiva', 'Ortodòncia', 'Cirurgia', 'Estètica', 'Conservadora'];

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
      next: (data) => {
        this.tratamientos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al carregar tractaments:', err);
        this.error = "No s'han pogut carregar els tractaments des del backend.";
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
      const matchCategory = this.selectedCategory === 'Tots' || categoriaField === this.selectedCategory;
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

    const operation = this.isEditing
      ? this.treatmentService.updateTratamiento(this.currentTratamiento)
      : this.treatmentService.addTratamiento(payload);

    operation.subscribe({
      next: () => {
        this.cargarTratamientos();
        this.cerrarFormulario();
      },
      error: (err) => {
        console.error('Error al desar el tractament:', err);
        this.error = 'Hi ha hagut un error en desar el tractament. Si us plau, torna-ho a provar.';
      }
    });
  }

  editar(tratamiento: Tratamiento) {
    this.abrirFormulario(tratamiento);
  }

  eliminar(id: number) {
    if (!id || id === 0) {
      alert('Error: ID de tractament no vàlid');
      return;
    }
    
    if (confirm('Estàs segur que vols eliminar aquest tractament?')) {
      console.log(`Eliminando tratamiento con id: ${id}`);
      this.treatmentService.deleteTratamiento(id).subscribe({
        next: () => {
          console.log(`Tratamiento ${id} eliminado. Recargando lista...`);
          this.cargarTratamientos();
        },
        error: (err) => {
          console.error('Error en eliminar el tractament:', err);
          this.error = `Error en eliminar: ${err.error?.message || err.message || 'Torna-ho a provar'}`;
        }
      });
    }
  }
}
