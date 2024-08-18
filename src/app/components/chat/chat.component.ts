import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Topic {
  name: string;
  suggestions?: Topic[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  representativeName: string | null = null;
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  depthReached = false;
  topicHistory: Topic[] = [];  // History of topics
  atFirstLevel = true;         // Indicator for first level

  constructor(private http: HttpClient) {}

  // Method to get the available representative
  getRepresentative() {
    this.http.get<{ name: string }>('http://localhost:3000/customer/available')
      .subscribe(response => {
        this.representativeName = response.name;
        this.loadTopics();
      });
  }

  // Method to load topics
  loadTopics() {
    this.http.get<Topic[]>('http://localhost:3000/topics')
      .subscribe(response => {
        this.topics = response;
        this.resetState();
      });
  }

  // Method to handle topic selection
  selectTopic(topic: Topic) {
    if (this.selectedTopic && !this.atFirstLevel) {
      this.topicHistory.push(this.selectedTopic);  // Save the current topic in history
    }

    this.selectedTopic = topic;
    this.topics = topic.suggestions || [];
    this.depthReached = !this.topics.length;
    this.atFirstLevel = false;
  }

  // Method to handle the "Go Back" button
  goBack() {
    if (this.topicHistory.length) {
      this.selectedTopic = this.topicHistory.pop() || null;
      this.topics = this.selectedTopic?.suggestions || [];
      this.depthReached = !this.topics.length;
      this.atFirstLevel = this.topicHistory.length === 0 && this.topicHistory[0] == this.selectedTopic ;
    } else {
      this.loadTopics();
    }
  }

  // Method to handle the "Start Again" button
  startAgain() {
    this.representativeName = null;
    this.loadTopics();  // Reload topics to start the chat again
  }

  // Method to determine if the "Go Back" button should be shown
  showBackButton(): boolean {
    return !this.depthReached && !this.atFirstLevel;
  }

  // Reset component state
  private resetState() {
    this.topicHistory = [];
    this.selectedTopic = null;
    this.depthReached = false;
    this.atFirstLevel = true;
  }
}
