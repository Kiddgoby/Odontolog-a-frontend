import { Component, inject } from '@angular/core';
import { FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string = '';

  // Usuarios de prueba
  users = [
    { email: 'dentista@clinica.com', password: '123', role: 'dentista' },
    { email: 'recepcionista@clinica.com', password: '123', role: 'recepcionista' }
  ];

  private router = inject(Router);

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
      alert('¡Acceso concedido! Bienvenido ' + user.role);
      localStorage.setItem('userRole', user.role);
    } else {
      console.error('Login incorrecto');
      this.errorMessage = 'Correo o contraseña incorrectos.';
    }
  }
}
