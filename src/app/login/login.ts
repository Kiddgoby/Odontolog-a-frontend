import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  // Usuarios de prueba
  users = [
    { email: 'dentista@clinica.com', password: '123', role: 'dentista' },
    { email: 'recepcionista@clinica.com', password: '123', role: 'recepcionista' }
  ];

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    console.log('LoginComponent instanciado');
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      remember: new FormControl(false)
    });
  }

  handleLogin() {
    console.log('Evento de click capturado exitosamente');
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Datos incompletos o correo no válido.';
      console.warn('Formulario inválido');
      return;
    }

    const { email, password } = this.loginForm.value;
    const user = this.users.find(u => u.email === email && u.password === password);

    if (user) {
      console.log('Login correcto:', user.role);

      if (isPlatformBrowser(this.platformId)) {
        console.log('Ejecutando lógica de navegación en navegador...');
        localStorage.setItem('userRole', user.role);
        alert('¡Login exitoso! Redirigiendo al Home...');

        console.log('Llamando a this.router.navigate(["/home"])...');
        this.router.navigate(['/home']).then(navigated => {
          console.log('Resultado de navegación:', navigated);
          if (navigated) {
            console.log('Navegación al Home exitosa');
          } else {
            console.error('La navegación al Home fue rechazada (navigated=false)');
          }
        }).catch(err => {
          console.error('Error FATAL durante la navegación:', err);
        });
      } else {
        console.log('Lógica de navegación saltada (estamos en el servidor)');
      }
    } else {
      console.error('Login incorrecto');
      this.errorMessage = 'Correo o contraseña incorrectos.';
    }
  }
}
