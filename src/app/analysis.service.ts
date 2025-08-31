import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AnalysisResult {
  Saudavel?: { confidence: number };
  Catarata?: { confidence: number };
  Glaucoma?: { confidence: number };
}

export interface BackendResponse {
  imageUrl: string;
  analysisResult: AnalysisResult;
  label: string;
  requestId: string;
  modelVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  uploadImageForAnalysis(file: File): Observable<BackendResponse> {
    console.log('Enviando arquivo para análise:', file.name, file.size);
    
    const formData = new FormData();
    formData.append('image', file);

    console.log('URL da requisição:', `${this.baseUrl}/upload`);
    
    return this.http.post<BackendResponse>(`${this.baseUrl}/upload`, formData);
  }

  // Método para mapear resposta do backend que pode ter acentos
  mapBackendResponse(backendResult: any): AnalysisResult {
    return {
      Saudavel: backendResult['Saudável'] || backendResult['Saudavel'],
      Catarata: backendResult['Catarata'],
      Glaucoma: backendResult['Glaucoma']
    };
  }
}
