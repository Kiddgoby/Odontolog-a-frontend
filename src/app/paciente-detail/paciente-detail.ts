import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService, PatientData } from '../services/patient.service';
import { NewAppointment } from '../new-appointment/new-appointment';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NewAppointment], // Importado correctamente para su uso en el template
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css'
})
export class PacienteDetail implements OnInit {
  patient: PatientData | undefined;
  isNewAppointmentModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  editForm!: FormGroup;
  isSaving: boolean = false;
  editErrorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadPatient();
  }

  loadPatient(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patientService.getPatientById(id).subscribe(data => {
      this.patient = data;
    });
  }

  openNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = true;
  }

  closeNewAppointmentModal(): void {
    this.isNewAppointmentModalOpen = false;
    this.loadPatient(); // Refresh data if needed
  }

  deletePatient(): void {
    if (!this.patient) return;

    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar a ${this.patient.firstName} ${this.patient.lastName}? Esta acción no se puede deshacer.`);

    if (confirmDelete) {
      this.patientService.deletePatient(this.patient.id).subscribe({
        next: () => {
          console.log('Paciente eliminado exitosamente');
          this.router.navigate(['/patient']);
        },
        error: (error) => {
          console.error('Error al eliminar el paciente:', error);
          alert('Error al eliminar el paciente. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  openEditModal(): void {
    if (!this.patient) return;
    
    this.editForm = this.formBuilder.group({
      firstName: [this.patient.firstName, Validators.required],
      lastName: [this.patient.lastName, Validators.required],
      age: [this.patient.age, Validators.required],
      nationalId: [this.patient.nationalId, Validators.required],
      phone: [this.patient.phone, [Validators.required, Validators.pattern(/^[+]?[0-9\s\-()]+$/)]],
      email: [this.patient.email, [Validators.required, Validators.email]],
      address: [this.patient.address, Validators.required],
      medicationAllergies: [this.patient.medicationAllergies],
      healthStatus: [this.patient.healthStatus],
      familyHistory: [this.patient.familyHistory],
      lifestyleHabits: [this.patient.lifestyleHabits],
      billingData: [this.patient.billingData]
    });
    
    this.isEditModalOpen = true;
    this.editErrorMessage = '';
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editErrorMessage = '';
  }

  savePatientChanges(): void {
    if (!this.patient || !this.editForm.valid) return;

    this.isSaving = true;
    this.editErrorMessage = '';

    const updatedData = this.editForm.value;

    this.patientService.updatePatient(this.patient.id, updatedData).subscribe({
      next: (updated) => {
        this.patient = updated;
        this.isSaving = false;
        this.closeEditModal();
        console.log('Paciente actualizado exitosamente');
      },
      error: (error) => {
        this.isSaving = false;
        this.editErrorMessage = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
        console.error('Error al actualizar el paciente:', error);
      }
    });
  }
}

