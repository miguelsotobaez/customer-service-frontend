import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';

interface Topic {
  name: string;
  suggestions?: Topic[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  representativeName: string | null = null;
  representativeImage: string | null = null;
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  depthReached = false;
  topicHistory: Topic[] = [];  // History of topics
  atFirstLevel = true;         // Indicator for first level

  private representativeId: number | null = null;

  constructor(private chatService: ChatService) {}

  getRepresentative() {
    this.chatService.getAvailableRepresentative().subscribe(
      (response) => {
        this.representativeName = response.name;
        this.representativeId = response.id;
        this.loadRepresentativeImage();
        this.loadTopics(); // Load topics after getting the representative
      },
      (error) => {
        console.error('Error fetching representative:', error);
      }
    );
  }

  loadRepresentativeImage() {
    if (this.representativeId !== null) {
      // Construct image path using ID
      this.representativeImage = `assets/profile-pictures/${this.representativeId}.jpeg`;
    }
  }

  // Method to load topics
  loadTopics() {
    this.chatService.getTopics().subscribe(
      (response) => {
        this.topics = response;
        this.topicHistory = [];
        this.selectedTopic = null;
        this.depthReached = false;
        this.atFirstLevel = true;
        this.resetState();
      },
      (error) => {
        console.error('Error fetching topics:', error);
      }
    );
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
