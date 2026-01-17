import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup;
  userId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      contact_number: ['']
    });
  }

  ngOnInit() {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find(u => u.id === this.userId);
        if (user) {
          this.editForm.patchValue({
            username: user.username,
            email: user.email,
            first_name: user.userDetails?.first_name || '',
            last_name: user.userDetails?.last_name || '',
            contact_number: user.userDetails?.contact_number || ''
          });
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load user data.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.editForm.valid && this.userId) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.editForm.value;
      const updateData: any = {
        username: formValue.username,
        email: formValue.email,
        userDetails: {
          first_name: formValue.first_name,
          last_name: formValue.last_name,
          contact_number: formValue.contact_number || undefined
        }
      };

      if (formValue.password) {
        updateData.password = formValue.password;
      }

      this.apiService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/landing']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update user. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.editForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancel() {
    this.router.navigate(['/landing']);
  }

  get username() { return this.editForm.get('username'); }
  get email() { return this.editForm.get('email'); }
  get password() { return this.editForm.get('password'); }
  get first_name() { return this.editForm.get('first_name'); }
  get last_name() { return this.editForm.get('last_name'); }
  get contact_number() { return this.editForm.get('contact_number'); }
}
