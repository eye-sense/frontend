import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface HistoryItem {
  objectId: number;
  modelVersion: string;
  catarataProbability: number;
  healthyProbability: number;
  glaucomaProbability: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.baseUrl}/history/list`);
    // MOCK: Retorna dados de exemplo para teste
    // const mockHistory: HistoryItem[] = [
    //   {
    //     objectId: 123,
    //     modelVersion: 'cnn-v1',
    //     catarataProbability: 99,
    //     healthyProbability: 2,
    //     glaucomaProbability: 0
    //   },
    //   {
    //     objectId: 122,
    //     modelVersion: 'cnn-v1',
    //     catarataProbability: 15,
    //     healthyProbability: 85,
    //     glaucomaProbability: 10
    //   },
    //   {
    //     objectId: 121,
    //     modelVersion: 'cnn-v1',
    //     catarataProbability: 5,
    //     healthyProbability: 20,
    //     glaucomaProbability: 75
    //   },
    //   {
    //     objectId: 120,
    //     modelVersion: 'cnn-v1',
    //     catarataProbability: 30,
    //     healthyProbability: 60,
    //     glaucomaProbability: 10
    //   }
    // ];

    // return new Observable<HistoryItem[]>(observer => {
    //   setTimeout(() => {
    //     observer.next(mockHistory);
    //     observer.complete();
    //   }, 1000); // simula delay de requisição
    // });
  }
}
