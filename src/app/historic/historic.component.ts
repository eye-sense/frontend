import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';
import { HistoryItem, HistoryService } from '../history.service';

@Component({
  selector: 'app-historic',
  imports: [CommonModule],
  templateUrl: './historic.component.html',
  styleUrl: './historic.component.css'
})
export class HistoricComponent implements OnInit {
  historyItems: HistoryItem[] = [];
  isLoading = false;
  userEmail: string | null = null;
  errorMessage: string | null = null;
  showError = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private historyService: HistoryService
  ) { }

  ngOnInit() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = this.authService.getUserEmail();
    this.loadHistory();
  }

  async loadHistory() {
    this.isLoading = true;
    try {
      this.historyItems = await firstValueFrom(this.historyService.listHistory());
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      this.showErrorMessage('Erro ao carregar histórico. Tente novamente mais tarde.');
    } finally {
      this.isLoading = false;
    }
  }

  public getDominantCondition(item: HistoryItem): { condition: string, percentage: number, type: 'success' | 'warning' | 'error' } {
    const healthy = item.healthyProbability || 0;
    const cataract = item.catarataProbability || 0;
    const glaucoma = item.glaucomaProbability || 0;

    const max = Math.max(healthy, cataract, glaucoma);

    if (healthy === max) {
      return { condition: 'Saudável', percentage: healthy, type: 'success' };
    } else if (cataract === max) {
      return { condition: 'Catarata', percentage: cataract, type: 'warning' };
    } else {
      return { condition: 'Glaucoma', percentage: glaucoma, type: 'error' };
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      this.router.navigate(['/login']);
    }
  }

  navigateToAnalysis() {
    this.router.navigate(['/analysis']);
  }

  private showErrorMessage(message: string, duration: number = 5000) {
    this.errorMessage = message;
    this.showError = true;

    setTimeout(() => {
      this.hideErrorMessage();
    }, duration);
  }

  hideErrorMessage() {
    this.showError = false;
    setTimeout(() => {
      this.errorMessage = null;
    }, 300);
  }

  trackByObjectId(index: number, item: HistoryItem): number {
    return item.objectId;
  }
}
