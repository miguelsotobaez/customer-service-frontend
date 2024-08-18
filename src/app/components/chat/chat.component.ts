import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  representativeName: string | null = null;
  topics: any[] = [];
  selectedTopic: any = null;
  depthReached = false;

  constructor(private http: HttpClient) {}

  // Método para obtener el representante disponible
  getRepresentative() {
    this.http.get<{ name: string }>('http://localhost:3000/customer/available')
      .subscribe(response => {
        this.representativeName = response.name;
        this.loadTopics(); // Cargar los temas después de obtener el representante
      });
  }

  // Método para cargar los temas
  loadTopics() {
    this.http.get<any[]>('http://localhost:3000/topics')
      .subscribe(response => {
        this.topics = response;
      });
  }

  // Método para manejar la selección de un tema
  selectTopic(topic: any) {
    this.selectedTopic = topic;
    if (topic.children && topic.children.length > 0) {
      this.topics = topic.children;
    } else {
      this.depthReached = true;
    }
  }
}