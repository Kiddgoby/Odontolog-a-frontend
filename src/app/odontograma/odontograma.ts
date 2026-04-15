import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
export class Odontograma implements OnInit, OnDestroy {
    @Input() patientId?: number;
    @Input() initialData?: OdontogramData;
    @Output() dataChange = new EventEmitter<OdontogramData>();

    colorActual: string = 'red';
    selectedHex: string = '#ff4d4d';

    odontogramData: OdontogramData = { teeth: {} };
    patientName: string = '';
    filterType: 'adult' | 'child' | 'combined' = 'combined';

    // Estado del modal de confirmación
    showModal: boolean = false;
    modalDiente: number = 0;
    modalSeccion: string = '';
    modalColor: string = '';
    modalNote: string = '';

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
            this.patientService.getPatientById(this.patientId).subscribe(patient => {
                if (patient) {
                    this.patientName = `${patient.firstName} ${patient.lastName}`;
                    if (patient.odontogram) {
                        this.odontogramData = JSON.parse(JSON.stringify(patient.odontogram));
                    }
                    // Asegurar que 'teeth' sea un objeto y no un array (problema de serialización PHP/JSON)
                    if (!this.odontogramData.teeth || Array.isArray(this.odontogramData.teeth)) {
                        this.odontogramData.teeth = {};
                    }
                }
            });
        } else if (this.initialData) {
            this.odontogramData = JSON.parse(JSON.stringify(this.initialData));
        }

        if (!this.odontogramData.teeth) {
            this.odontogramData.teeth = {};
        }
    }

    ngOnDestroy(): void {
        this.saveFinal();
    }

    selectColor(color: string): void {
        this.colorActual = color;
        if (this.colors[color]) {
            this.selectedHex = this.colors[color];
        }
    }

    setFilter(type: 'adult' | 'child' | 'combined'): void {
        this.filterType = type;
    }

    isAnterior(numero: number): boolean {
        return this.anteriorTeeth.includes(numero);
    }

    getToothState(numero: number): ToothState {
        if (!this.odontogramData.teeth[numero]) {
            this.odontogramData.teeth[numero] = { sections: {}, absent: false };
        }
        // Asegurar que 'sections' sea un objeto y no un array (problema de serialización PHP/JSON)
        if (Array.isArray(this.odontogramData.teeth[numero].sections)) {
            this.odontogramData.teeth[numero].sections = {};
        }
        return this.odontogramData.teeth[numero];
    }

    onSectionClick(numero: number, sectionIndex: string): void {
        const tooth = this.getToothState(numero);
        this.modalDiente = numero;
        this.modalSeccion = sectionIndex;
        this.modalColor = this.colorActual;

        // Cargar nota específica de la sección si existe
        this.modalNote = (tooth.sectionNotes && tooth.sectionNotes[sectionIndex]) || '';
        this.showModal = true;
    }

    guardarCambio(): void {
        const tooth = this.getToothState(this.modalDiente);

        // Inicializar sectionNotes si no existe
        if (!tooth.sectionNotes) {
            tooth.sectionNotes = {};
        }

        // Si hay una nota, la añadimos también a las notas generales del odontograma
        if (this.modalNote && this.modalNote.trim() !== '') {
            const toothName = this.getToothName(this.modalDiente);
            const sectionName = this.getSectionName(this.modalDiente, this.modalSeccion);
            const pathologyName = this.getPathologyName(this.modalColor);

            // Solo añadir si la nota ha cambiado o es nueva para esta sección
            if (tooth.sectionNotes[this.modalSeccion] !== this.modalNote) {
                const newNoteEntry = `${toothName} (${sectionName}) - ${pathologyName}: ${this.modalNote}`;

                if (!this.odontogramData.notes) {
                    this.odontogramData.notes = newNoteEntry;
                } else {
                    this.odontogramData.notes += `\n${newNoteEntry}`;
                }
            }
        }

        // Guardar nota específica para la sección
        tooth.sectionNotes[this.modalSeccion] = this.modalNote;

        if (this.modalColor === 'black') {
            tooth.absent = !tooth.absent;
        } else if (this.modalColor === 'erase') {
            delete tooth.sections[this.modalSeccion];
            if (tooth.sectionNotes) delete tooth.sectionNotes[this.modalSeccion];
            tooth.absent = false;
        } else {
            tooth.sections[this.modalSeccion] = this.colors[this.modalColor];
            tooth.absent = false;
        }

        this.saveChanges();
        this.cerrarModal();
    }

    eliminarCambio(): void {
        const tooth = this.getToothState(this.modalDiente);
        delete tooth.sections[this.modalSeccion];
        if (tooth.sectionNotes) delete tooth.sectionNotes[this.modalSeccion];
        tooth.absent = false;
        this.saveChanges();
        this.cerrarModal();
    }

    cerrarModal(): void {
        this.showModal = false;
    }

    saveChanges(): void {
        if (this.patientId) {
            this.patientService.updateOdontogram(this.patientId, this.odontogramData);
        }
        this.dataChange.emit(this.odontogramData);
    }

    saveFinal(): void {
        if (this.patientId) {
            this.patientService.saveOdontogramImmediately(this.patientId, this.odontogramData).subscribe();
        }
    }

    getSectionFill(numero: number, sectionIndex: string): string {
        const tooth = this.odontogramData.teeth[numero];
        if (tooth && tooth.sections[sectionIndex]) {
            return tooth.sections[sectionIndex];
        }
        return 'white';
    }

    getToothName(num: number): string {
        const names: { [key: number]: string } = {
            1: 'Incisivo Central',
            2: 'Incisivo Lateral',
            3: 'Canino',
            4: 'Primer Premolar',
            5: 'Segundo Premolar',
            6: 'Primer Molar',
            7: 'Segundo Molar',
            8: 'Tercer Molar'
        };
        const n = num % 10;
        const q = Math.floor(num / 10);
        const toothBase = names[n] || 'Diente';

        let location = '';
        if (q === 1 || q === 5) location = 'Superior Derecho';
        if (q === 2 || q === 6) location = 'Superior Izquierdo';
        if (q === 3 || q === 7) location = 'Inferior Izquierdo';
        if (q === 4 || q === 8) location = 'Inferior Derecho';

        const type = (q > 4) ? 'Temporal ' : '';
        return `${toothBase} ${type}${location}`;
    }

    getSectionName(num: number, section: string): string {
        const sectionNames: { [key: string]: string } = {
            s1: 'Superior (Vestibular)',
            s2: 'Derecha',
            s3: 'Inferior (Palatino/Lingual)',
            s4: 'Izquierda',
            s5: 'Centro (Oclusal)'
        };
        return sectionNames[section] || section;
    }

    getPathologyName(colorKey: string): string {
        const names: { [key: string]: string } = {
            red: 'Pendiente',
            blue: 'Realizado',
            green: 'Caries',
            yellow: 'Sellado',
            black: 'Ausencia',
            erase: 'Borrado'
        };
        return names[colorKey] || colorKey;
    }

    goBack(): void {
        this.saveFinal();
        if (this.patientId) {
            this.router.navigate(['/patient', this.patientId]);
        } else {
            this.router.navigate(['/patient']);
        }
    }
}
