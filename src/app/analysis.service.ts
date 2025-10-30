import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AnalysisResult {
  Saudavel?: { confidence: number };
  Doente?: { confidence: number };
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

    // MOCK: Retorna o JSON de exemplo para testes
    // const mockResponse: BackendResponse = {
    //   imageUrl: 'https://meu-bucket.s3.amazonaws.com/uploads/123abc.jpg',
    //   analysisResult: {
    //     Doente: { confidence: 90 },
    //     Saudavel: { confidence: 10 },
    //     Catarata: { confidence: 80 },
    //     Glaucoma: { confidence: 20 }
    //   },
    //   label: 'Catarata',
    //   requestId: 'teste-cli',
    //   modelVersion: 'cnn-v1'
    // };
    // return new Observable<BackendResponse>(observer => {
    //   setTimeout(() => {
    //     observer.next(mockResponse);
    //     observer.complete();
    //   }, 1000); // simula delay de requisição
    // });
  }

  // Método para mapear resposta do backend que pode ter acentos
  mapBackendResponse(backendResult: any): AnalysisResult {
    return {
      Saudavel: backendResult['Saudável'] || backendResult['Saudavel'],
      Catarata: backendResult['Catarata'],
      Glaucoma: backendResult['Glaucoma'],
      Doente: backendResult['Doente'],
    };
  }
}
