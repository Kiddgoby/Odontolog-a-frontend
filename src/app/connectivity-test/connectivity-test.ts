import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService, PatientData } from '../services/patient.service';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-connectivity-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>Prueba de Conectividad (Frontend <-> Backend)</h2>
      <p class="api-url">Probando: <code>http://localhost:8000/api/patients</code></p>
      
      <div class="actions">
        <button (click)="testGetAll()" class="btn btn-get" [disabled]="loading">Probar GET (Obtener todos)</button>
        <button (click)="testPost()" class="btn btn-post" [disabled]="loading">Probar POST (Crear paciente prueba)</button>
      </div>

      <div *ngIf="loading" class="status loading">Cargando (timeout en 10s)...</div>
      <div *ngIf="error" class="status error">
        <strong>Error:</strong> {{ error }}
        <p *ngIf="errorDetails" class="details">{{ errorDetails }}</p>
      </div>
      <div *ngIf="successMessage" class="status success">{{ successMessage }}</div>

      <div class="results" *ngIf="results">
        <h3>Resultados:</h3>
        <pre>{{ results | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .test-container { padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.5; }
    .api-url { color: #666; margin-bottom: 20px; }
    .actions { margin-bottom: 20px; display: flex; gap: 10px; }
    .btn { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: bold; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-get { background-color: #007bff; }
    .btn-post { background-color: #28a745; }
    .status { margin: 10px 0; padding: 15px; border-radius: 4px; }
    .loading { background-color: #fff3cd; color: #856404; border-left: 5px solid #ffeeba; }
    .error { background-color: #f8d7da; color: #721c24; border-left: 5px solid #f5c6cb; }
    .success { background-color: #d4edda; color: #155724; border-left: 5px solid #c3e6cb; }
    .details { font-size: 0.85em; margin-top: 5px; background: rgba(0,0,0,0.05); padding: 5px; border-radius: 2px; }
    .results { background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #dee2e6; overflow-x: auto; margin-top: 20px; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
  `]
})
export class ConnectivityTest {
  private patientService = inject(PatientService);
  
  results: any = null;
  loading = false;
  error: string | null = null;
  errorDetails: string | null = null;
  successMessage: string | null = null;

  testGetAll() {
    this.resetState();
    console.log('ConnectivityTest: Iniciando testGetAll...');
    this.patientService.getPatients().pipe(
      timeout(10000),
      catchError(err => {
        console.error('ConnectivityTest: Error capturado en pipe:', err);
        this.handleError(err, 'GET');
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        console.log('ConnectivityTest: Recibida respuesta GET:', data);
        if (data) {
          this.results = data;
          this.loading = false;
          this.successMessage = `Éxito: Se han obtenido ${data.length} pacientes.`;
        }
      },
      error: (e) => console.error('ConnectivityTest: Error en subscribe GET:', e),
      complete: () => console.log('ConnectivityTest: Observable GET completado')
    });
  }

  testPost() {
    this.resetState();
    this.loading = true;
    const testPatient = {
      firstName: 'Test',
      lastName: 'Connectivity ' + new Date().getTime(),
      email: 'test@example.com',
      phone: '123456789',
      address: 'Test Address'
    };

    console.log('ConnectivityTest: Iniciando testPost...');
    this.patientService.addPatient(testPatient).pipe(
      timeout(10000),
      catchError(err => {
        console.error('ConnectivityTest: Error capturado en pipe POST:', err);
        this.handleError(err, 'POST');
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        console.log('ConnectivityTest: Recibida respuesta POST:', data);
        if (data) {
          this.results = data;
          this.loading = false;
          this.successMessage = 'Éxito: Paciente de prueba creado.';
        }
      },
      error: (e) => console.error('ConnectivityTest: Error en subscribe POST:', e),
      complete: () => console.log('ConnectivityTest: Observable POST completado')
    });
  }

  private handleError(err: any, method: string) {
    this.loading = false;
    this.error = `Error al realizar ${method}`;
    this.errorDetails = err.message || JSON.stringify(err);
    console.error(`Error en ConnectivityTest (${method}):`, err);
  }

  private resetState() {
    this.results = null;
    this.error = null;
    this.errorDetails = null;
    this.successMessage = null;
    this.loading = false;
  }
}
