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
  currentUser: any = null;
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
      contact_number: [''],
      address: ['']
    });
  }

  ngOnInit() {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    // Check if user has token (authenticated)
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You are not authenticated. Please login first.';
      this.router.navigate(['/login']);
      return;
    }
    
    // Get current user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // If editing the current user, use the cached data
      if (user.id === this.userId) {
        this.currentUser = user;
        this.populateForm(user);
        return;
      }
    }
    
    // Otherwise try to load from API
    this.loadUser();
  }

  populateForm(user: any) {
    this.editForm.patchValue({
      username: user.username,
      email: user.email,
      first_name: user.userDetails?.first_name || '',
      last_name: user.userDetails?.last_name || '',
      contact_number: user.userDetails?.contact_number || '',
      address: user.userDetails?.address || ''
    });
  }

  loadUser() {
    this.loading = true;
    this.errorMessage = '';
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find(u => u.id === this.userId);
        if (user) {
          this.currentUser = user;
          this.populateForm(user);
        } else {
          // If user not found in API, at least we have the form displayed
          console.warn('User not found in API');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        // Don't show error if we already have the user from localStorage
        if (!this.currentUser) {
          this.errorMessage = error.error?.message || 'Failed to load user data. Please try again.';
        }
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
        userDetails: {
          contact_number: formValue.contact_number || undefined,
          address: formValue.address || undefined
        }
      };

      if (formValue.password && formValue.password.trim()) {
        updateData.password = formValue.password;
      }

      this.apiService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully!';
          this.loading = false;
          
          // Update localStorage with new data
          if (this.currentUser) {
            this.currentUser.userDetails = {
              ...this.currentUser.userDetails,
              contact_number: formValue.contact_number,
              address: formValue.address
            };
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }
          
          setTimeout(() => {
            this.router.navigate(['/landing']);
          }, 1500);
        },
        error: (error) => {
          console.error('Update error:', error);
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
  get address() { return this.editForm.get('address'); }
}
