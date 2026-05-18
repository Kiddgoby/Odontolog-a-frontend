import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { TreatmentService, Tratamiento } from '../services/treatment.service';
import { PatientService, PatientData } from '../services/patient.service';
import { DentistService, DentistData } from '../services/dentist.service';
import { BoxService, BoxData } from '../services/box.service';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-appointment.html',
  styleUrl: './new-appointment.css',
})
export class NewAppointment implements OnInit {
  @Input() initialDate: string = '';
  @Input() patientId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  appointmentData = {
    patient_id: null as number | null,
    dentist_id: null as number | null,
    treatment_id: null as number | null,
    box_id: null as number | null,
    fecha: '',
    hora: '',
    tratamiento: '' // This will store the reason/name for the backend
  };

  patients: PatientData[] = [];
  doctors: DentistData[] = [];
  boxes: BoxData[] = [];
  allTreatments: Tratamiento[] = [];
  filteredTreatments: Tratamiento[] = [];
  showSuggestions: boolean = false;
  doctorTreatments: Tratamiento[] = []; // Tratamientos del doctor seleccionado
  existingAppointments: any[] = []; // Citas existentes para evitar colisiones

  constructor(
    private appointmentService: AppointmentService,
    private treatmentService: TreatmentService,
    private patientService: PatientService,
    private dentistService: DentistService,
    private boxService: BoxService
  ) { }

  ngOnInit(): void {

    this.treatmentService.getTratamientos().subscribe({
      next: (treatments) => {
        this.allTreatments = treatments;
      },
      error: (err) => {
        console.error('Error cargando tratamientos para citas:', err);
      }
    });


    this.loadData();

    if (this.initialDate) {
      this.appointmentData.fecha = this.initialDate;
    }
    if (this.patientId) {
      this.appointmentData.patient_id = this.patientId;
    }
  }


  onTreatmentInput(): void {
    if (this.appointmentData.tratamiento) {
      const search = this.appointmentData.tratamiento.toLowerCase();
      this.filteredTreatments = this.allTreatments.filter(t => {
        const nombre = (t as any).nombre || t.name || t.treatmentName || '';
        return nombre.toLowerCase().includes(search);
      });
      this.showSuggestions = this.filteredTreatments.length > 0;
    } else {
      this.filteredTreatments = [];
      this.showSuggestions = false;
    }
  }

  selectedPatientAllergies: string = '';

  hasAllergies(medicationAllergies: string | undefined): boolean {
    if (!medicationAllergies) return false;
    const lower = medicationAllergies.trim().toLowerCase();
    return lower !== '' && lower !== 'none' && lower !== 'ninguna' && lower !== 'ninguno' && lower !== 'no' && lower !== 'sin alergias';
  }

  onPatientChange(value: number | string | Event): void {
    const patientId = typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number((value.target as HTMLSelectElement).value);

    this.appointmentData.patient_id = patientId;

    if (patientId) {
      console.log(`Cargando datos del paciente ID: ${patientId}`);
      this.patientService.getPatientById(patientId).subscribe({
        next: (patient) => {
          console.log('Datos del paciente:', patient);
          this.selectedPatientAllergies = patient.medicationAllergies || '';

          if (this.hasAllergies(this.selectedPatientAllergies)) {
            this.appointmentData.hora = '19:00';
            console.log('Paciente con alergias/infectado, forzando hora a las 19:00');
          }

          if (patient.boxId) {
            this.appointmentData.box_id = patient.boxId;
            console.log('Box asignado al paciente:', patient.boxId);
          }

          if (patient.treatmentId) {
            this.appointmentData.treatment_id = patient.treatmentId;
            const treatment = this.allTreatments.find(t => t.id === patient.treatmentId);
            if (treatment) {
              this.appointmentData.tratamiento = (treatment as any).nombre || treatment.name || '';
              console.log('Tratamiento asignado al paciente:', this.appointmentData.tratamiento);
            }
            this.filteredTreatments = this.allTreatments;
          }
        },
        error: (err) => {
          console.error('Error cargando datos del paciente:', err);
        }
      });
    }
  }

  selectTreatment(treatment: Tratamiento): void {
    const nombre = (treatment as any).nombre || treatment.name || treatment.treatmentName || '';
    this.appointmentData.tratamiento = nombre;
    this.appointmentData.treatment_id = treatment.id;
    this.showSuggestions = false;
    console.log('Tratamiento seleccionado por selectTreatment:', nombre, 'ID:', treatment.id);
  }

  loadData(): void {
    this.patientService.getPatients().subscribe((data: PatientData[]) => {
      this.patients = data;
      if (this.appointmentData.patient_id) {
        const patient = data.find(p => p.id === this.appointmentData.patient_id);
        if (patient && this.hasAllergies(patient.medicationAllergies)) {
          this.appointmentData.hora = '19:00';
          console.log('Paciente pre-seleccionado con alergias, estableciendo hora a las 19:00');
        }
      }
    });
    this.dentistService.getDentists().subscribe((data: DentistData[]) => {
      this.doctors = data;
    });
    this.treatmentService.getTratamientos().subscribe((data: Tratamiento[]) => {
      this.allTreatments = data;
      this.filteredTreatments = data; // Mostrar todos inicialmente
    });
    this.boxService.getBoxes().subscribe((data: BoxData[]) => {
      this.boxes = data;
      // Seleccionar el primer box por defecto si está disponible
      if (data.length > 0) {
        this.appointmentData.box_id = data[0].id;
      }
    });

    this.appointmentService.getAppointments().subscribe({
      next: (data) => {
        this.existingAppointments = data;
        console.log('Citas existentes cargadas para colisiones:', data.length);
      },
      error: (err) => {
        console.error('Error cargando citas para colisiones:', err);
      }
    });
  }

  onDoctorChange(value: number | string | Event): void {
    const doctorId = typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number((value.target as HTMLSelectElement).value);
    this.appointmentData.dentist_id = doctorId;

    this.appointmentData.treatment_id = null;
    this.appointmentData.tratamiento = '';

    if (doctorId) {
      console.log(`Cargando datos del doctor ID: ${doctorId}`);

      this.dentistService.getDentistById(doctorId).subscribe({
        next: (doctor) => {
          console.log('Datos del doctor:', doctor);

          if (doctor.boxId) {
            this.appointmentData.box_id = doctor.boxId;
            console.log('Box asignado al doctor:', doctor.boxId);
          }

          if (doctor.treatmentId) {
            this.appointmentData.treatment_id = doctor.treatmentId;
            const treatment = this.allTreatments.find(t => t.id === doctor.treatmentId);
            if (treatment) {
              this.appointmentData.tratamiento = (treatment as any).nombre || treatment.name || '';
              console.log('Tratamiento asignado al doctor:', this.appointmentData.tratamiento);
            }
          }
        },
        error: (err) => {
          console.error('Error cargando datos del doctor:', err);
        }
      });

      this.dentistService.getDentistTreatments(doctorId).subscribe({
        next: (treatments) => {
          console.log('Tratamientos recibidos del doctor:', treatments);
          if (treatments && treatments.length > 0) {
            // Mapear los tratamientos devueltos por el backend
            this.doctorTreatments = treatments.map((t: any) => ({
              id: t.id,
              name: t.name || t.treatmentName,
              treatmentName: t.name || t.treatmentName,
              description: t.description,
              categoria: t.categoria || t.category,
              duracion: t.duracion || t.duration,
              precio: t.precio || t.price,
              nombre: t.name || t.treatmentName,
              descripcion: t.description
            }));
            this.filteredTreatments = this.doctorTreatments;
            console.log('Tratamientos filtrados:', this.filteredTreatments);
            
            // Si solo hay un tratamiento, autoseleccionar
            if (this.doctorTreatments.length === 1) {
              console.log('Solo hay un tratamiento, autoseleccionando:', this.doctorTreatments[0]);
              this.selectTreatment(this.doctorTreatments[0]);
            }
          } else {
            console.warn('No hay tratamientos específicos para este doctor, mostrando todos');
            this.filteredTreatments = this.allTreatments;
            this.doctorTreatments = [];
          }
        },
        error: (err) => {
          console.error('Error cargando tratamientos del doctor:', err);
          // En caso de error, mostrar todos los tratamientos
          this.filteredTreatments = this.allTreatments;
          this.doctorTreatments = [];
        }
      });
    } else {
      // Si no hay doctor seleccionado, mostrar todos los tratamientos
      this.filteredTreatments = this.allTreatments;
      this.doctorTreatments = [];
    }
  }

  onTreatmentChange(value: number | string | Event): void {
    const treatmentId = typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number((value.target as HTMLSelectElement).value);

    const treatment = this.doctorTreatments.find(t => t.id === treatmentId) || 
                      this.allTreatments.find(t => t.id === treatmentId);
    if (treatment) {
      this.appointmentData.treatment_id = treatment.id;
      this.appointmentData.tratamiento = (treatment as any).nombre || treatment.name || '';
      console.log('Tratamiento seleccionado:', this.appointmentData.tratamiento);
    }
  }

  isTimeInvalid(): boolean {
    if (!this.appointmentData.hora) return false;
    const [hours, minutes] = this.appointmentData.hora.split(':').map(Number);
    
    // Rule 1: No appointments starting at or after 20:00
    if (hours >= 20) return true;

    // Rule 2: Allergic/infectious patient must be scheduled at 19:00 (last slot)
    if (this.hasSelectedPatientAllergies()) {
      return this.appointmentData.hora !== '19:00';
    }
    
    return false;
  }

  isAfterClosingTime(): boolean {
    if (!this.appointmentData.hora) return false;
    const [hours, minutes] = this.appointmentData.hora.split(':').map(Number);
    return hours >= 20;
  }

  hasSelectedPatientAllergies(): boolean {
    if (!this.appointmentData.patient_id) return false;
    const patient = this.patients.find(p => p.id === this.appointmentData.patient_id);
    const allergies = patient ? (patient.medicationAllergies || '') : this.selectedPatientAllergies;
    return this.hasAllergies(allergies);
  }

  getCollisionError(): string | null {
    if (!this.appointmentData.fecha || !this.appointmentData.hora) return null;
    
    for (const app of this.existingAppointments) {
      if (app.fecha === this.appointmentData.fecha && app.hora === this.appointmentData.hora) {
        // Verificar colisión de doctor (mismo doctor a la misma hora)
        if (this.appointmentData.dentist_id && Number(app.dentist_id) === Number(this.appointmentData.dentist_id)) {
          return "Aquest doctor ja té una cita programada a aquesta hora.";
        }
        // Verificar colisión de consultorio / Box (mismo box a la misma hora)
        if (this.appointmentData.box_id && Number(app.box_id) === Number(this.appointmentData.box_id)) {
          return "Aquest consultori (Box) ja està ocupat a aquesta hora.";
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.isTimeInvalid() || this.getCollisionError() !== null) {
      return;
    }
    if (this.appointmentData.patient_id && 
        this.appointmentData.dentist_id && 
        this.appointmentData.fecha && 
        this.appointmentData.hora &&
        this.appointmentData.treatment_id &&
        this.appointmentData.box_id) {
      this.appointmentService.addAppointment(this.appointmentData).subscribe({
        next: () => {
          this.created.emit();
          this.close.emit();
        },
        error: err => {
          console.error('Error creando cita', err);
        }
      });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
