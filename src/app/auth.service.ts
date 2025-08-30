import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor() { }

  async login(email: string, password: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation for demo purposes
    if (email && password) {
      this.isAuthenticated = true;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      return true;
    }
    
    throw new Error('Invalid credentials');
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return this.isAuthenticated;
  }

  getUserEmail(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('userEmail');
    }
    return null;
  }
}
