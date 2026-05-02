import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  private router = inject(Router);
  private authService = inject(Auth);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      remember: new FormControl(false)
    });
  }

  handleLogin() {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Dades incompletes o correu no vàlid.';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginForm.enable();
        console.log('Login correcte:', response.role);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginForm.enable();
        console.error('Error en el login:', error);
        this.errorMessage = error.error?.message || 'Correu o contrasenya incorrectes.';
      }
    });
  }
}
