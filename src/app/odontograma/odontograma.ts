import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, OdontogramData, ToothState } from '../services/patient.service';

@Component({
    selector: 'app-odontograma',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './odontograma.html',
    styleUrl: './odontograma.css'
})
export class Odontograma implements OnInit {
    @Input() patientId?: number;
    @Input() initialData?: OdontogramData;
    @Output() dataChange = new EventEmitter<OdontogramData>();

    colorActual: string = 'red';
    selectedHex: string = '#ff4d4d';

    odontogramData: OdontogramData = { teeth: {} };
    patientName: string = '';

    colors: { [key: string]: string } = {
        red: "#ff4d4d",
        blue: "#4d79ff",
        green: "#4dff88",
        yellow: "#ffff4d",
        black: "#000"
    };

    quadrants = {
        q1: { adults: [18, 17, 16, 15, 14, 13, 12, 11], temporals: [55, 54, 53, 52, 51] },
        q2: { adults: [21, 22, 23, 24, 25, 26, 27, 28], temporals: [61, 62, 63, 64, 65] },
        q3: { adults: [31, 32, 33, 34, 35, 36, 37, 38], temporals: [71, 72, 73, 74, 75] },
        q4: { adults: [48, 47, 46, 45, 44, 43, 42, 41], temporals: [85, 84, 83, 82, 81] }
    };

    anteriorTeeth = [13, 12, 11, 21, 22, 23, 53, 52, 51, 61, 62, 63, 83, 82, 81, 71, 72, 73, 43, 42, 41, 31, 32, 33];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private patientService: PatientService
    ) { }

    ngOnInit(): void {
        if (!this.patientId) {
            const idFromRoute = this.route.snapshot.paramMap.get('id');
            if (idFromRoute) {
                this.patientId = Number(idFromRoute);
            }
        }

        if (this.patientId) {
            const patient = this.patientService.getPatientById(this.patientId);
            if (patient) {
                this.patientName = patient.nombre;
                if (patient.odontogram) {
                    this.odontogramData = JSON.parse(JSON.stringify(patient.odontogram));
                }
            }
        } else if (this.initialData) {
            this.odontogramData = JSON.parse(JSON.stringify(this.initialData));
        }

        if (!this.odontogramData.teeth) {
            this.odontogramData.teeth = {};
        }
    }

    selectColor(color: string): void {
        this.colorActual = color;
        if (this.colors[color]) {
            this.selectedHex = this.colors[color];
        }
    }

    isAnterior(numero: number): boolean {
        return this.anteriorTeeth.includes(numero);
    }

    getToothState(numero: number): ToothState {
        if (!this.odontogramData.teeth[numero]) {
            this.odontogramData.teeth[numero] = { sections: {}, absent: false };
        }
        return this.odontogramData.teeth[numero];
    }

    onSectionClick(numero: number, sectionIndex: string): void {
        const tooth = this.getToothState(numero);

        if (this.colorActual === 'black') {
            tooth.absent = !tooth.absent;
        } else if (this.colorActual === 'erase') {
            delete tooth.sections[sectionIndex];
            tooth.absent = false;
        } else {
            tooth.sections[sectionIndex] = this.selectedHex;
            tooth.absent = false;
        }

        this.saveChanges();
    }

    saveChanges(): void {
        if (this.patientId) {
            this.patientService.updateOdontogram(this.patientId, this.odontogramData);
        }
        this.dataChange.emit(this.odontogramData);
    }

    getSectionFill(numero: number, sectionIndex: string): string {
        const tooth = this.odontogramData.teeth[numero];
        if (tooth && tooth.sections[sectionIndex]) {
            return tooth.sections[sectionIndex];
        }
        return 'white';
    }

    goBack(): void {
        if (this.patientId) {
            this.router.navigate(['/patient', this.patientId]);
        } else {
            this.router.navigate(['/patient']);
        }
    }
}
