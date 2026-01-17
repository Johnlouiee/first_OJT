import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService, User } from '../../services/api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showProfileSection = false;
  showUserList = true;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check for login success message
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess) {
      this.successMessage = loginSuccess;
      localStorage.removeItem('loginSuccess');
    }

    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorMessage = '';
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.errorMessage = error.error?.message || 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  editUser(userId: number) {
    this.router.navigate(['/edit-user', userId]);
  }

  editProfile() {
    if (this.currentUser?.id) {
      this.router.navigate(['/edit-user', this.currentUser.id]);
    }
  }

  toggleProfileSection() {
    this.showProfileSection = !this.showProfileSection;
  }

  toggleUserList() {
    this.showUserList = !this.showUserList;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getFullName(user: User): string {
    if (user.userDetails?.first_name && user.userDetails?.last_name) {
      return `${user.userDetails.first_name} ${user.userDetails.last_name}`;
    }
    return '-';
  }

  getContact(user: User): string {
    return user.userDetails?.contact_number || '-';
  }
}
