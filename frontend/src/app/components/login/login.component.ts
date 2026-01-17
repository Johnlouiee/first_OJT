import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Check for register success message
    const registerSuccess = localStorage.getItem('registerSuccess');
    if (registerSuccess) {
      this.successMessage = registerSuccess;
      localStorage.removeItem('registerSuccess');
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.apiService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('loginSuccess', 'Login successful!');
          this.successMessage = '';
          this.errorMessage = '';
          this.router.navigate(['/landing']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.successMessage = '';
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
