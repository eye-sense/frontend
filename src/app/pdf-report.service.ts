import { Injectable } from '@angular/core';
import { AnalysisResult } from './analysis.service';

export interface ReportData {
  userEmail: string;
  fileName: string;
  fileSize: string;
  imagePreview: string | null;
  analysisResult: AnalysisResult;
  recommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {

  constructor() { }

  async generatePdfReport(data: ReportData): Promise<void> {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      let yPosition = 20;

      // Header com fundo verde principal
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Logo e título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('EYE SENSE', 20, 25);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Análise Oftalmológica Inteligente', 20, 32);

      // Data no canto direito
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Relatório gerado em: ${currentDate}`, pageWidth - 20, 25, { align: 'right' });

      yPosition = 60;

      // Informações do usuário
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DA ANÁLISE', 20, yPosition);

      yPosition += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Usuário: ${data.userEmail}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Arquivo analisado: ${data.fileName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Tamanho do arquivo: ${data.fileSize}`, 20, yPosition);

      yPosition += 20;

      // Adicionar imagem se disponível
      if (data.imagePreview) {
        try {
          const imgWidth = 80;
          const imgHeight = 60;
          const imgX = (pageWidth - imgWidth) / 2;

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('IMAGEM ANALISADA', imgX + imgWidth / 2, yPosition, { align: 'center' });
          yPosition += 10;

          doc.addImage(data.imagePreview, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
        } catch (error) {
          console.warn('Erro ao adicionar imagem ao PDF:', error);
          yPosition += 10;
        }
      }

      // Resultados da análise
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RESULTADOS DA ANÁLISE', 20, yPosition);

      yPosition += 15;

      const saudavelConf = data.analysisResult.Saudavel?.confidence || 0;
      const doenteConf = data.analysisResult.Doente?.confidence || 0;
      const isHealthy = saudavelConf > doenteConf;

      // Avaliação Geral
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Avaliação Geral:', 20, yPosition);
      yPosition += 10;

      // Saudável vs Doente
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      if (isHealthy) {
        doc.setTextColor(16, 185, 129); // success color
        doc.text(`✓ Saudável: ${saudavelConf}%`, 30, yPosition);
        yPosition += 8;
        doc.setTextColor(107, 114, 128); // gray color
        doc.text(`  Doente: ${doenteConf}%`, 30, yPosition);
      } else {
        doc.setTextColor(107, 114, 128); // gray color
        doc.text(`  Saudável: ${saudavelConf}%`, 30, yPosition);
        yPosition += 8;
        doc.setTextColor(239, 68, 68); // error color
        doc.text(`⚠ Doente: ${doenteConf}%`, 30, yPosition);
      }

      yPosition += 15;

      // Detalhamento das condições (se doente)
      if (!isHealthy) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalhamento da Condição:', 20, yPosition);
        yPosition += 10;

        const catarataConf = data.analysisResult.Catarata?.confidence || 0;
        const glaucomaConf = data.analysisResult.Glaucoma?.confidence || 0;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Catarata
        if (catarataConf > glaucomaConf) {
          doc.setTextColor(245, 158, 11); // warning color
          doc.text(`⚠ Catarata: ${catarataConf}%`, 30, yPosition);
          yPosition += 8;
          doc.setTextColor(107, 114, 128); // gray color
          doc.text(`  Glaucoma: ${glaucomaConf}%`, 30, yPosition);
        } else {
          doc.setTextColor(107, 114, 128); // gray color
          doc.text(`  Catarata: ${catarataConf}%`, 30, yPosition);
          yPosition += 8;
          doc.setTextColor(239, 68, 68); // error color
          doc.text(`⚠ Glaucoma: ${glaucomaConf}%`, 30, yPosition);
        }
        yPosition += 15;
      }

      // Recomendação
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMENDAÇÃO MÉDICA', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const splitRecommendation = doc.splitTextToSize(data.recommendation, pageWidth - 40);
      doc.text(splitRecommendation, 20, yPosition);
      yPosition += splitRecommendation.length * 6 + 15;

      // Verificar se precisamos de nova página
      if (yPosition + 30 > pageHeight - 30) {
        doc.addPage();
        yPosition = 30;
      }

      // Aviso importante
      doc.setFillColor(255, 243, 205); // bg-amber-50
      doc.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
      doc.setDrawColor(245, 158, 11); // border-amber-500
      doc.rect(15, yPosition - 5, pageWidth - 30, 25);

      doc.setTextColor(146, 64, 14); // text-amber-800
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠ IMPORTANTE', 20, yPosition + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const importantText = 'Este relatório é baseado em análise de inteligência artificial e não substitui a consulta com um profissional médico qualificado. Sempre procure um oftalmologista para diagnóstico e tratamento adequados.';
      const splitImportant = doc.splitTextToSize(importantText, pageWidth - 50);
      doc.text(splitImportant, 20, yPosition + 12);

      // Footer
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Eye Sense - Análise Inteligente de Saúde Ocular', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Salvar o PDF
      const fileName = `eye-sense-analise-${new Date().toISOString().split('T')[0]}-${Date.now()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}
