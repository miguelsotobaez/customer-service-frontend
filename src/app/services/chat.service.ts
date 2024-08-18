import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000'; // Ajusta la URL según la configuración de tu backend

  constructor(private http: HttpClient) {}

  getAvailableRepresentative(): Observable<{ name: string; isAvailable: boolean }> {
    return this.http.get<{ name: string; isAvailable: boolean }>(`${this.apiUrl}/customer/available`);
  }

  getTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/topics`);
  }
}