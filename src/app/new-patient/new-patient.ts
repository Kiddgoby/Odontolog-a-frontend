import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-new-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './new-patient.html',
  styleUrl: './new-patient.css'
})
export class NewPatient implements OnInit {
  patientForm!: FormGroup;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      nationalId: ['', [Validators.required]],
      socialSecurityNumber: [''],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      billingData: [''],
      healthStatus: [''],
      familyHistory: [''],
      lifestyleHabits: [''],
      medicationAllergies: [''],
      registrationDate: [today]
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSaving = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.patientService.addPatient(this.patientForm.value).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Paciente guardado correctamente.';
          setTimeout(() => {
            this.router.navigate(['/patient']);
          }, 1500);
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error al guardar paciente', err);
          this.errorMessage = 'No se pudo guardar el paciente. Verifique la conexión al servidor y los datos.';
        }
      });
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
