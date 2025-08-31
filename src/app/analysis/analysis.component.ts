import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AnalysisService, AnalysisResult } from '../analysis.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analysis',
  imports: [CommonModule],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.css'
})
export class AnalysisComponent implements OnInit {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragOver = false;
  isAnalyzing = false;
  analysisProgress = 0;
  analysisResult: AnalysisResult | null = null;
  userEmail: string | null = null;
  errorMessage: string | null = null;
  showError = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private analysisService: AnalysisService
  ) {}

  ngOnInit() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = this.authService.getUserEmail();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showErrorMessage('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showErrorMessage('O arquivo deve ter no máximo 10MB.');
      return;
    }

    this.selectedFile = file;
    this.createImagePreview(file);
  }

  private createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.analysisResult = null;
  }

  async analyzeImage() {
    if (!this.selectedFile) return;

    this.isAnalyzing = true;
    this.analysisProgress = 0;
    let progressInterval: any;

    try {
      // Simular progresso da requisição
      progressInterval = setInterval(() => {
        if (this.analysisProgress < 90) {
          this.analysisProgress += Math.random() * 10;
        }
      }, 300);

      // Fazer a requisição para o backend usando o serviço
      const response = await firstValueFrom(
        this.analysisService.uploadImageForAnalysis(this.selectedFile)
      );

      clearInterval(progressInterval);
      this.analysisProgress = 100;

      // Processar a resposta do backend
      if (response && response.analysisResult) {
        // Mapear usando o método do serviço
        this.analysisResult = this.analysisService.mapBackendResponse(response.analysisResult);
      }

      setTimeout(() => {
        this.isAnalyzing = false;
      }, 500);

    } catch (error: any) {
      console.error('Erro na análise:', error);
      
      // Limpar progresso e parar análise
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      this.isAnalyzing = false;
      this.analysisProgress = 0;
      
      // Mostrar erro ao usuário
      const errorMessage = error?.error?.error || error?.message || 'Erro de conexão';
      this.showErrorMessage(`Erro ao conectar com o backend: ${errorMessage}. Verifique se o servidor está rodando na porta 8090.`, 8000);
      
      // NÃO usar dados mock - deixar sem resultado
      return;
    }
  }

  private generateMockResults() {
    // Generate random but realistic confidence scores
    const results = [
      { saudavel: 85, catarata: 10, glaucoma: 5 },
      { saudavel: 25, catarata: 70, glaucoma: 5 },
      { saudavel: 20, catarata: 15, glaucoma: 65 },
      { saudavel: 60, catarata: 30, glaucoma: 10 },
      { saudavel: 45, catarata: 45, glaucoma: 10 }
    ];

    const randomResult = results[Math.floor(Math.random() * results.length)];
    
    this.analysisResult = {
      Saudavel: { confidence: randomResult.saudavel },
      Catarata: { confidence: randomResult.catarata },
      Glaucoma: { confidence: randomResult.glaucoma }
    };
  }

  getRecommendation(): string {
    if (!this.analysisResult) return '';

    const saudavelConf = this.analysisResult.Saudavel?.confidence || 0;
    const catarataConf = this.analysisResult.Catarata?.confidence || 0;
    const glaucomaConf = this.analysisResult.Glaucoma?.confidence || 0;

    const maxConfidence = Math.max(saudavelConf, catarataConf, glaucomaConf);

    if (saudavelConf === maxConfidence) {
      return 'Os resultados indicam um olho aparentemente normal. Continue com exames regulares para manter a saúde ocular.';
    } else if (catarataConf === maxConfidence) {
      return 'Possível presença de catarata detectada. Recomendamos consultar um oftalmologista para avaliação e possível tratamento.';
    } else {
      return 'Possível presença de glaucoma detectada. É importante procurar um oftalmologista imediatamente para exames complementares.';
    }
  }

  downloadReport() {
    // Simulate report download
    const reportContent = this.generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eye-sense-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateReportContent(): string {
    if (!this.analysisResult) return '';

    return `
EYE SENSE - RELATÓRIO DE ANÁLISE OFTALMOLÓGICA

Data: ${new Date().toLocaleDateString('pt-BR')}
Usuário: ${this.userEmail}
Arquivo: ${this.selectedFile?.name}

RESULTADOS DA ANÁLISE:
- Olho Saudável: ${this.analysisResult.Saudavel?.confidence || 0}%
- Catarata: ${this.analysisResult.Catarata?.confidence || 0}%
- Glaucoma: ${this.analysisResult.Glaucoma?.confidence || 0}%

RECOMENDAÇÃO:
${this.getRecommendation()}

IMPORTANTE:
Este relatório é baseado em análise de inteligência artificial e não substitui 
a consulta com um profissional médico qualificado. Sempre procure um oftalmologista 
para diagnóstico e tratamento adequados.

Eye Sense - Análise Inteligente de Saúde Ocular
    `.trim();
  }

  newAnalysis() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.analysisResult = null;
    this.analysisProgress = 0;
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

  private showErrorMessage(message: string, duration: number = 5000) {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-hide após o tempo especificado
    setTimeout(() => {
      this.hideErrorMessage();
    }, duration);
  }

  hideErrorMessage() {
    this.showError = false;
    setTimeout(() => {
      this.errorMessage = null;
    }, 300); // Tempo para animação
  }
}
