import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;

    try {
      // Simulate login process
      await this.authService.login(this.email, this.password);
      
      // Navigate to analysis page on successful login
      this.router.navigate(['/analysis']);
    } catch (error) {
      console.error('Login failed:', error);
      // Here you would typically show an error message
    } finally {
      this.isLoading = false;
    }
  }
}
