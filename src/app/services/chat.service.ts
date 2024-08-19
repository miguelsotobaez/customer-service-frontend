import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAvailableRepresentative(): Observable<{ id: number, name: string; isAvailable: boolean }> {
    return this.http.get<{ id: number, name: string; isAvailable: boolean }>(`${this.apiUrl}/customer/available`);
  }

  getTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/topics`);
  }
}