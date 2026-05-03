import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, OdontogramData, ToothState } from '../services/patient.service';
import { OdontogramaService } from '../services/odontograma.service';

interface OdontogramDetailData {
    id?: number;
    odontogramId: number;
    toothId: number;
    pathologyId?: number;
    treatmentId?: number;
    statusId?: number;
    notes?: string;
    face?: string;
}

interface PathologyItem {
    id: number;
    description: string;
    key: string;
    hex: string;
    label?: string;
}

interface TreatmentItem {
    id: number;
    name: string;
    key: string;
    hex: string;
    label?: string;
}

interface StatusItem {
    id: number;
    name: string;
    key: string;
    hex: string;
}

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

    lastClickedTooth: number | null = null;
    lastClickedSection: string | null = null;

    showModal: boolean = false;
    modalDiente: number = 0;
    modalSeccion: string = '';
    modalColor: string = '';
    modalNote: string = '';
    modalPathology: string = 'caries';
    modalTreatment: string = '';


    colors: { [key: string]: string } = {
        red: "#ff4d4d",
        blue: "#4d79ff",
        black: "#000",
        erase: "#ffffff"
    };

    coloresList: { key: string; hex: string; label: string }[] = [
        { key: 'red', hex: '#ff4d4d', label: 'Pendent' },
        { key: 'blue', hex: '#4d79ff', label: 'Realitzat' }
    ];

    pathologyList: { key: string; hex: string; label: string; backendId?: number }[] = [
        { key: 'caries', hex: '#E53935', label: 'Caries' },
        { key: 'gingivitis', hex: '#FB8C00', label: 'Gingivitis' },
        { key: 'periodontitis', hex: '#8E24AA', label: 'Periodontitis' },
        { key: 'fractura', hex: '#5D4037', label: 'Fractura' },
        { key: 'ausencia', hex: '#212121', label: 'Ausencia' }
    ];

    treatmentList: { key: string; hex: string; label: string; backendId?: number }[] = [
        { key: 'limpieza', hex: '#26A69A', label: 'Limpieza' },
        { key: 'obsturacion', hex: '#1E88E5', label: 'Obsturacion' },
        { key: 'endodoncia', hex: '#8E24AA', label: 'Endodoncia' },
        { key: 'extraccion', hex: '#D32F2F', label: 'Extraccion' },
        { key: 'blanqueamiento', hex: '#FDD835', label: 'Blanqueamiento' }
    ];

    modalTab: 'pathology' | 'treatment' = 'pathology';

    pathologyPopupOpen: boolean = false;
    treatmentPopupOpen: boolean = false;

    getItemLabel(key: string | null, type: 'pathology' | 'treatment' = 'pathology'): string {
        if (!key) return '';

        console.log(`🔍 getItemLabel Debug:`);
        console.log(`  - type: ${type}`);
        console.log(`  - key: ${key}`);
        console.log(`  - pathologyList:`, this.pathologyList);
        console.log(`  - treatmentList:`, this.treatmentList);

        const list = type === 'pathology' ? this.pathologyList : this.treatmentList;
        const item = list.find(item => item.key === key);

        console.log(`  - item encontrado:`, item);
        console.log(`  - label final: ${item?.label || key || ''}`);

        return item?.label || key || '';
    }

    get selectedItemHex(): string {
        const allItems = [...this.pathologyList, ...this.treatmentList];
        const found = allItems.find(i => i.key === this.modalPathology);
        return found ? found.hex : '#e2e8f0';
    }

    openPathologyPopup(): void {
        this.pathologyPopupOpen = true;
        this.treatmentPopupOpen = false;
    }

    openTreatmentPopup(): void {
        this.treatmentPopupOpen = true;
        this.pathologyPopupOpen = false;
    }

    closePopup(): void {
        this.pathologyPopupOpen = false;
        this.treatmentPopupOpen = false;
    }

    selectPathology(key: string): void {
        console.log('🦷 Patología seleccionada:', key);
        this.modalPathology = key;
        this.closePopup();
    }

    selectTreatment(key: string): void {
        console.log('🔧 Tratamiento seleccionado:', key);
        this.modalTreatment = key;
        this.closePopup();
    }

    removeTreatment(): void {
        this.modalTreatment = '';
    }

    pathologyColors: { [key: string]: string } = {
        caries: "#4dff88",
        sellado: "#ffff4d"
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
        private patientService: PatientService,
        private odontogramaService: OdontogramaService

    ) { }

    backendPathologies: any[] = [];
    backendTreatments: any[] = [];
    backendStatuses: any[] = [];
    odontogramId: number | null = null;

    ngOnInit(): void {
        this.loadInitialData();
        this.loadBackendData();
    }

    loadInitialData(): void {
        if (!this.patientId) {
            const idFromRoute = this.route.snapshot.paramMap.get('id');
            if (idFromRoute) {
                this.patientId = Number(idFromRoute);
            }
        }

        if (this.patientId) {
            this.odontogramaService.getOrCreateOdontogram(this.patientId).subscribe({
                next: (odontogramResponse) => {
                    console.log('✅ Odontograma obtenido/creado:', odontogramResponse);
                    this.odontogramId = odontogramResponse.id ?? this.patientId;

                    this.patientService.getPatientById(this.patientId!).subscribe(patient => {
                        if (patient) {
                            this.patientName = `${patient.firstName} ${patient.lastName}`;
                            if (patient.odontogram) {
                                this.odontogramData = JSON.parse(JSON.stringify(patient.odontogram));
                            }
                            if (!this.odontogramData.teeth || Array.isArray(this.odontogramData.teeth)) {
                                this.odontogramData.teeth = {};
                            }
                        }
                    });
                },
                error: (error) => {
                    console.error('❌ Error obteniendo/creando odontograma:', error);
                    this.odontogramId = this.patientId ?? null;

                    this.patientService.getPatientById(this.patientId!).subscribe(patient => {
                        if (patient) {
                            this.patientName = `${patient.firstName} ${patient.lastName}`;
                            if (patient.odontogram) {
                                this.odontogramData = JSON.parse(JSON.stringify(patient.odontogram));
                            }
                            if (!this.odontogramData.teeth || Array.isArray(this.odontogramData.teeth)) {
                                this.odontogramData.teeth = {};
                            }
                        }
                    });
                }
            });
        } else if (this.initialData) {
            this.odontogramData = JSON.parse(JSON.stringify(this.initialData));
        }

        if (!this.odontogramData.teeth) {
            this.odontogramData.teeth = {};
        }
    }

    loadBackendData(): void {
        console.log('🔄 Cargando datos del backend...');

        this.odontogramaService.getPathologies().subscribe({
            next: (data: any[]) => {
                console.log('✅ Patologías desde DB:', data);
                if (data && data.length > 0) {
                    this.pathologyList = data.map(p => ({
                        key: p.description.toLowerCase().replace(/\s+/g, ''),
                        label: p.description,
                        hex: this.getPathologyColor(p.description),
                        backendId: p.id
                    }));
                }
            }
        });

        this.odontogramaService.getTreatments().subscribe({
            next: (data: any[]) => {
                console.log('✅ Tratamientos desde DB:', data);
                if (data && data.length > 0) {
                    this.treatmentList = data.map(t => ({
                        key: t.name.toLowerCase().replace(/\s+/g, ''),
                        label: t.name,
                        hex: this.getTreatmentColor(t.name),
                        backendId: t.id
                    }));
                }
            }
        });

        this.odontogramaService.getStatuses().subscribe({
            next: (data) => {
                this.backendStatuses = data;
            }
        });
    }

    private getPathologyColor(desc: string): string {
        const colors: { [key: string]: string } = {
            'Caries': '#E53935',
            'Gingivitis': '#FB8C00',
            'Periodontitis': '#8E24AA',
            'Fractura': '#5D4037',
            'Ausencia': '#212121'
        };
        return colors[desc] || '#BDBDBD';
    }

    private getTreatmentColor(name: string): string {
        const colors: { [key: string]: string } = {
            'Limpieza': '#26A69A',
            'Obsturacion': '#1E88E5',
            'Endodoncia': '#8E24AA',
            'Extraccion': '#D32F2F',
            'Blanqueamiento': '#FDD835'
        };
        return colors[name] || '#9E9E9E';
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

    get selectedPathologyHex(): string {
        const found = this.pathologyList.find(i => i.key === this.modalPathology);
        return found ? found.hex : '#e2e8f0';
    }

    get selectedTreatmentHex(): string {
        const found = this.treatmentList.find(i => i.key === this.modalTreatment);
        return found ? found.hex : '#e2e8f0';
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
        if (Array.isArray(this.odontogramData.teeth[numero]?.sections)) {
            this.odontogramData.teeth[numero]!.sections = {};
        }
        return this.odontogramData.teeth[numero]!;
    }

    onSectionClick(numero: number, sectionIndex: string): void {
        this.lastClickedTooth = numero;
        this.lastClickedSection = sectionIndex;

        if (this.colorActual === 'erase') {
            this.eraseSectionDirectly();
            return;
        }

        if (this.colorActual === 'black') {
            this.markAbsenceDirectly(numero);
            return;
        }

        const tooth = this.getToothState(numero);
        this.modalDiente = numero;
        this.modalSeccion = sectionIndex;
        this.modalColor = this.colorActual;

        this.modalNote = (tooth.sectionNotes && tooth.sectionNotes[sectionIndex]) || '';
        this.modalPathology = (tooth.pathologyTypes && tooth.pathologyTypes[sectionIndex]) || 'caries';
        this.modalTreatment = (tooth.treatmentTypes && tooth.treatmentTypes[sectionIndex]) || '';

        this.showModal = true;
    }

    eraseSectionDirectly(): void {
        if (!this.lastClickedTooth || !this.lastClickedSection) {
            return;
        }

        const tooth = this.getToothState(this.lastClickedTooth);
        delete tooth.sections[this.lastClickedSection!];
        if (tooth.sectionNotes) delete tooth.sectionNotes[this.lastClickedSection!];
        if (tooth.pathologyTypes) delete tooth.pathologyTypes[this.lastClickedSection!];
        tooth.absent = false;

        this.saveChanges();
        console.log(`✅ Sección ${this.lastClickedSection} del diente ${this.lastClickedTooth} borrada`);
    }


    markAbsenceDirectly(toothNumber: number): void {
        const tooth = this.getToothState(toothNumber);
        tooth.absent = true;

        tooth.sections = {};
        if (tooth.sectionNotes) tooth.sectionNotes = {};
        if (tooth.pathologyTypes) tooth.pathologyTypes = {};

        if (this.patientId) {
            this.patientService.updateToothAbsence(this.patientId, toothNumber, true).subscribe();
        }

        this.saveChanges();
        console.log(`✅ Diente ${toothNumber} marcado como AUSENTE`);
    }


    guardarCambio(): void {
        const tooth = this.getToothState(this.modalDiente);

        if (!this.odontogramId) {
            console.error('❌ Error: odontogramId es null. No se puede guardar sin un ID de odontograma.');
            alert('Error: No hay un odontograma asociado. Por favor, recarga la página.');
            return;
        }

        const pathologyItem = this.pathologyList.find(p => p.key === this.modalPathology);
        const treatmentItem = this.treatmentList.find(t => t.key === this.modalTreatment);

        if (!pathologyItem) {
            console.error('❌ Error: No se encontró la patología seleccionada:', this.modalPathology);
            alert('Error: Patología no válida. Por favor, selecciona una patología válida.');
            return;
        }

        const detailData = {
            odontogramId: this.odontogramId,
            toothId: this.getToothDatabaseId(this.modalDiente),
            pathologyId: pathologyItem?.backendId,
            treatmentId: treatmentItem?.backendId,
            face: this.modalSeccion,
            notes: this.modalNote || ''
        };

        console.log('=== DATOS PARA GUARDAR ===');
        console.log('detailData:', detailData);
        console.log('pathologyItem:', pathologyItem);
        console.log('treatmentItem:', treatmentItem);
        console.log('odontogramId:', this.odontogramId);
        console.log('modalDiente:', this.modalDiente);
        console.log('modalSeccion:', this.modalSeccion);
        console.log('modalPathology:', this.modalPathology);
        console.log('modalTreatment:', this.modalTreatment);
        console.log('=============================');

        const payload = JSON.stringify(detailData, null, 2);
        console.log('🚀 Iniciando guardado de detalle:', {
            url: `${this.odontogramaService['apiUrl']}/odontogram-details`,
            data: detailData
        });

        this.odontogramaService.saveDetail(detailData).subscribe({
            next: (response) => {
                console.log('✅ RESPUESTA SERVIDOR:', response);
                console.log('✨ Detalle guardado con éxito en DB');

                if (!tooth.sectionNotes) tooth.sectionNotes = {};
                if (!tooth.pathologyTypes) tooth.pathologyTypes = {};
                if (!tooth.treatmentTypes) tooth.treatmentTypes = {};

                tooth.pathologyTypes[this.modalSeccion] = this.modalPathology;
                if (this.modalTreatment) {
                    tooth.treatmentTypes[this.modalSeccion] = this.modalTreatment;
                }

                let finalColor = this.colors[this.modalColor as keyof typeof this.colors] || '#ffffff';
                if (treatmentItem) finalColor = treatmentItem.hex;
                tooth.sections[this.modalSeccion] = finalColor;
                tooth.sectionNotes[this.modalSeccion] = this.modalNote;

                let noteEntry = `${this.getToothName(this.modalDiente)} (${this.getSectionName(this.modalDiente, this.modalSeccion)}): `;
                noteEntry += `${this.getItemLabel(this.modalPathology, 'pathology')}`;
                if (this.modalTreatment) {
                    noteEntry += ` → ${this.getItemLabel(this.modalTreatment, 'treatment')}`;
                }
                if (this.modalNote) {
                    noteEntry += `: ${this.modalNote}`;
                }

                if (!this.odontogramData.notes) {
                    this.odontogramData.notes = noteEntry;
                } else {
                    this.odontogramData.notes += `\n${noteEntry}`;
                }

                this.saveChanges();
                this.cerrarModal();
            },
            error: (error) => {
                console.error('❌ ERROR AL GUARDAR:', error);

                let errorMessage = 'Error al guardar en el servidor';
                let diagnosticInfo = '';

                if (error.status === 0) {
                    errorMessage = 'No se puede conectar con el servidor';
                    diagnosticInfo = 'Asegúrate de que Symfony esté corriendo (symfony server:start)';
                } else if (error.status === 500) {
                    errorMessage = 'Error interno del servidor (500)';
                    diagnosticInfo = error.error?.error || 'Revisa los logs de Symfony para más detalles.';
                } else {
                    errorMessage = error.error?.message || errorMessage;
                }

                alert(`${errorMessage}\n\n${diagnosticInfo}`);

                console.log('🔄 Fallback: Guardando localmente...');
                this.guardarLocalmente(tooth, pathologyItem, treatmentItem);
                this.cerrarModal();
            }
        });
    }

    private guardarLocalmente(tooth: ToothState, pathologyItem: any, treatmentItem: any): void {
        console.log('💾 Guardando localmente...');

        if (!tooth.sectionNotes) tooth.sectionNotes = {};
        if (!tooth.pathologyTypes) tooth.pathologyTypes = {};
        if (!tooth.treatmentTypes) tooth.treatmentTypes = {};

        tooth.pathologyTypes[this.modalSeccion] = this.modalPathology;
        if (this.modalTreatment) {
            tooth.treatmentTypes[this.modalSeccion] = this.modalTreatment;
        }

        let finalColor = this.colors[this.modalColor as keyof typeof this.colors] || '#ffffff';
        if (treatmentItem) finalColor = treatmentItem.hex;
        tooth.sections[this.modalSeccion] = finalColor;
        tooth.sectionNotes[this.modalSeccion] = this.modalNote;

        let noteEntry = `${this.getToothName(this.modalDiente)} (${this.getSectionName(this.modalDiente, this.modalSeccion)}): `;
        noteEntry += `${this.getItemLabel(this.modalPathology, 'pathology')}`;
        if (this.modalTreatment) {
            noteEntry += ` → ${this.getItemLabel(this.modalTreatment, 'treatment')}`;
        }
        if (this.modalNote) {
            noteEntry += `: ${this.modalNote}`;
        }

        if (!this.odontogramData.notes) {
            this.odontogramData.notes = noteEntry;
        } else {
            this.odontogramData.notes += `\n${noteEntry}`;
        }

        this.saveChanges();
        console.log('✅ Guardado local completado');
    }

    eliminarCambio(): void {
        const tooth = this.getToothState(this.modalDiente);
        delete tooth.sections[this.modalSeccion];
        if (tooth.sectionNotes) delete tooth.sectionNotes[this.modalSeccion];
        if (tooth.pathologyTypes) delete tooth.pathologyTypes[this.modalSeccion];
        tooth.absent = false;
        this.saveChanges();
        this.cerrarModal();
    }

    cerrarModal(): void {
        this.showModal = false;
        this.modalPathology = 'caries';
        this.modalTreatment = '';
        this.modalNote = '';
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
        if (tooth?.sections?.[sectionIndex]) {
            return tooth.sections[sectionIndex];
        }
        return 'transparent';
    }

    getToothName(num: number): string {
        const names: { [key: number]: string } = {
            1: 'Incisiu Central',
            2: 'Incisiu Lateral',
            3: 'Caní',
            4: 'Primer Premolar',
            5: 'Segon Premolar',
            6: 'Primer Molar',
            7: 'Segon Molar',
            8: 'Tercer Molar'
        };
        const n = num % 10;
        const q = Math.floor(num / 10);
        const toothBase = names[n] || 'Dent';

        let location = '';
        if (q === 1 || q === 5) location = 'Superior Dret';
        if (q === 2 || q === 6) location = 'Superior Esquerre';
        if (q === 3 || q === 7) location = 'Inferior Esquerre';
        if (q === 4 || q === 8) location = 'Inferior Dret';

        const type = (q > 4) ? 'Temporal ' : '';
        return `${toothBase} ${type}${location}`;
    }

    getSectionName(num: number, section: string): string {
        const sectionNames: { [key: string]: string } = {
            s1: 'Superior (Vestibular)',
            s2: 'Dret',
            s3: 'Inferior (Palatí/Lingual)',
            s4: 'Esquerre',
            s5: 'Centre (Oclusal)'
        };
        return sectionNames[section] || section;
    }

    getPathologyName(colorKey: string, pathologyType?: string): string {
        const names: { [key: string]: string } = {
            red: 'Pendiente',
            blue: 'Realizado',
            black: 'Ausencia',
            erase: 'Borrado'
        };

        if (pathologyType) {
            const pathologyNames: { [key: string]: string } = {
                caries: 'Caries',
                sellado: 'Sellado'
            };
            return `${names[colorKey]} - ${pathologyNames[pathologyType]}`;
        }

        return names[colorKey] || colorKey;
    }

    getToothDatabaseId(toothNumber: number): number {
        return toothNumber;
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