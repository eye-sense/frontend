import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const params = new HttpParams()
        .set('email', email)
        .set('password', password);

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      const response = await firstValueFrom(
        this.http.post<{ success: boolean, email?: string, error?: string }>(
          `${this.baseUrl}/login`,
          params.toString(),
          { headers }
        )
      );

      if (response.success) {
        this.isAuthenticated = true;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', response.email || email);
        return true;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      this.isAuthenticated = false;
      if (error.status === 401) {
        throw new Error('Email or password incorrect');
      } else if (error.status === 500) {
        throw new Error(`Internal server error: ${error.error?.error || error.message}`);
      } else {
        throw new Error('Network error. Please try again.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.get(`${this.baseUrl}/logout`));
    } catch (error) {
      // Log error but continue with local logout
      console.warn('Server logout failed, continuing with local logout');
    } finally {
      this.isAuthenticated = false;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
    }
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
