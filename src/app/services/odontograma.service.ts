import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OdontogramDetailData {
    id?: number;
    odontogramId: number;
    toothId: number;
    pathologyId?: number;
    treatmentId?: number;
    statusId?: number;
    notes?: string;
    face?: string;
}

export interface PathologyItem {
    id: number;
    description: string;
    key: string;
    hex: string;
}

export interface TreatmentItem {
    id: number;
    name: string;
    key: string;
    hex: string;
}

export interface StatusItem {
    id: number;
    name: string;
    key: string;
    hex: string;
}

@Injectable({
    providedIn: 'root'
})
export class OdontogramaService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    getPathologies(): Observable<PathologyItem[]> {
        return this.http.get<PathologyItem[]>(`${this.apiUrl}/pathologies`);
    }

    getTreatments(): Observable<TreatmentItem[]> {
        return this.http.get<TreatmentItem[]>(`${this.apiUrl}/treatments`);
    }

    getStatuses(): Observable<StatusItem[]> {
        return this.http.get<StatusItem[]>(`${this.apiUrl}/statuses`);
    }

    saveDetail(data: OdontogramDetailData): Observable<any> {
        return this.http.post(`${this.apiUrl}/odontogram-details`, data);
    }

    updateDetail(id: number, data: Partial<OdontogramDetailData>): Observable<any> {
        return this.http.put(`${this.apiUrl}/odontogram-details/${id}`, data);
    }

    deleteDetail(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/odontogram-details/${id}`);
    }

    getOdontogramDetails(odontogramId: number): Observable<OdontogramDetailData[]> {
        return this.http.get<OdontogramDetailData[]>(`${this.apiUrl}/odontogram-details/odontogram/${odontogramId}`);
    }

    updateNotes(odontogramId: number, toothId: number, notes: string, face?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/odontogram-details/update-notes`, {
            odontogramId,
            toothId,
            notes,
            cara: face
        });
    }

    getNotes(odontogramId: number, toothId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/odontogram-details/get-notes/${odontogramId}/${toothId}`);
    }

    getOrCreateOdontogram(patientId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/odontograms/get-or-create`, { patientId });
    }
}
