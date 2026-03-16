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
      this.patientService.addPatient(this.patientForm.value).subscribe(() => {
        this.router.navigate(['/patient']);
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
