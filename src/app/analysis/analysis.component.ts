import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

interface AnalysisResult {
  normal: { confidence: number };
  cataract: { confidence: number };
  glaucoma: { confidence: number };
}

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

  constructor(
    private router: Router,
    private authService: AuthService
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
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 10MB.');
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

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      this.analysisProgress += Math.random() * 15;
      if (this.analysisProgress > 95) {
        this.analysisProgress = 95;
      }
    }, 200);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    clearInterval(progressInterval);
    this.analysisProgress = 100;

    // Simulate analysis results
    setTimeout(() => {
      this.generateMockResults();
      this.isAnalyzing = false;
    }, 500);
  }

  private generateMockResults() {
    // Generate random but realistic confidence scores
    const results = [
      { normal: 85, cataract: 10, glaucoma: 5 },
      { normal: 25, cataract: 70, glaucoma: 5 },
      { normal: 20, cataract: 15, glaucoma: 65 },
      { normal: 60, cataract: 30, glaucoma: 10 },
      { normal: 45, cataract: 45, glaucoma: 10 }
    ];

    const randomResult = results[Math.floor(Math.random() * results.length)];
    
    this.analysisResult = {
      normal: { confidence: randomResult.normal },
      cataract: { confidence: randomResult.cataract },
      glaucoma: { confidence: randomResult.glaucoma }
    };
  }

  getRecommendation(): string {
    if (!this.analysisResult) return '';

    const maxConfidence = Math.max(
      this.analysisResult.normal.confidence,
      this.analysisResult.cataract.confidence,
      this.analysisResult.glaucoma.confidence
    );

    if (this.analysisResult.normal.confidence === maxConfidence) {
      return 'Os resultados indicam um olho aparentemente normal. Continue com exames regulares para manter a saúde ocular.';
    } else if (this.analysisResult.cataract.confidence === maxConfidence) {
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
- Olho Normal: ${this.analysisResult.normal.confidence}%
- Catarata: ${this.analysisResult.cataract.confidence}%
- Glaucoma: ${this.analysisResult.glaucoma.confidence}%

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
