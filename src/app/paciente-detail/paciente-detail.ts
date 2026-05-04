import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService, PatientData } from '../services/patient.service';
import { NewAppointment } from '../new-appointment/new-appointment';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NewAppointment], // Importado correctamente para su uso en el template
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css'
})
export class PacienteDetail implements OnInit {
  patient: PatientData | undefined;
  isNewAppointmentModalOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
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
}

