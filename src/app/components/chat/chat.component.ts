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
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  representativeName: string | null = null;
  representativeImage: string | null = null;
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  depthReached = false;
  topicHistory: Topic[] = [];
  atFirstLevel = true;
  isLoading = false;

  private representativeId: number | null = null;

  constructor(private chatService: ChatService) {}

  getRepresentative() {
    this.isLoading = true;
    this.chatService.getAvailableRepresentative().subscribe(
      (response) => {
        this.representativeName = response.name;
        this.representativeId = response.id;
        this.loadRepresentativeImage();
        this.loadTopics();
      },
      (error) => {
        console.error('Error fetching representative:', error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  loadRepresentativeImage() {
    if (this.representativeId !== null) {
      this.representativeImage = `assets/profile-pictures/${this.representativeId}.jpeg`;
    }
  }

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
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  selectTopic(topic: Topic) {
    if (this.selectedTopic && !this.atFirstLevel) {
      this.topicHistory.push(this.selectedTopic);
    }

    this.selectedTopic = topic;
    this.topics = topic.suggestions || [];
    this.depthReached = !this.topics.length;
    this.atFirstLevel = false;
  }

  goBack() {
    if (this.topicHistory.length) {
      this.selectedTopic = this.topicHistory.pop() || null;
      this.topics = this.selectedTopic?.suggestions || [];
      this.depthReached = !this.topics.length;
      this.atFirstLevel =
        this.topicHistory.length === 0 &&
        this.topicHistory[0] == this.selectedTopic;
    } else {
      this.loadTopics();
    }
  }

  startAgain() {
    this.representativeName = null;
    this.loadTopics();
  }

  showBackButton(): boolean {
    return !this.depthReached && !this.atFirstLevel;
  }

  private resetState() {
    this.topicHistory = [];
    this.selectedTopic = null;
    this.depthReached = false;
    this.atFirstLevel = true;
  }
}
