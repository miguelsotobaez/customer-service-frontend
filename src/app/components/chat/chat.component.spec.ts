import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ChatService } from '../../services/chat.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let httpTestingController: HttpTestingController;
  let chatService: ChatService;

  const mockTopics = [
    {
      name: 'Football',
      suggestions: [
        {
          name: 'Premier League',
          suggestions: [
            { name: 'Liverpool' },
            { name: 'Man. UTD' },
            { name: 'Man. City' },
          ],
        },
        {
          name: 'Serie A',
          suggestions: [
            { name: 'Milan' },
            { name: 'Inter' },
            { name: 'Juventus' },
          ],
        },
      ],
    },
    {
      name: 'Books',
      suggestions: [
        {
          name: 'Investment',
          suggestions: [
            { name: 'The Intelligent Investor - Benjamin Graham' },
            { name: 'Rich Dad, Poor Dad - Robert Kiyosaki' },
          ],
        },
        {
          name: 'Children',
          suggestions: [
            { name: 'Momo - Michael Ende' },
            { name: 'BFG - Roald Dahl' },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), ChatService],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ChatService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.representativeName).toBeNull();
    expect(component.topics).toEqual([]);
    expect(component.selectedTopic).toBeNull();
    expect(component.depthReached).toBe(false);
    expect(component.atFirstLevel).toBe(true);
  });

  it('should fetch a representative and load topics', () => {
    component.getRepresentative();

    const reqRep = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/customer/available')
    );
    expect(reqRep.request.method).toBe('GET');
    reqRep.flush({ id: 1, name: 'Alice', isAvailable: true });

    expect(component.representativeName).toBe('Alice');
    expect(component.representativeImage).toBe(
      'assets/profile-pictures/1.jpeg'
    );

    const reqTopics = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/topics')
    );
    expect(reqTopics.request.method).toBe('GET');
    reqTopics.flush(mockTopics);

    expect(component.topics.length).toBeGreaterThan(0);
    expect(component.topics).toEqual(mockTopics);
  });

  it('should handle error when fetching representative', () => {
    const consoleSpy = spyOn(console, 'error');

    component.getRepresentative();

    const reqRep = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/customer/available')
    );
    reqRep.flush('Service error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching representative:',
      jasmine.any(HttpErrorResponse)
    );

    const errorArg = consoleSpy.calls.mostRecent().args[1];
    expect(errorArg.status).toBe(500);
    expect(errorArg.statusText).toBe('Internal Server Error');
  });

  it('should handle topic selection and go back', () => {
    component.topics = mockTopics;

    component.selectTopic(mockTopics[0]);

    expect(component.selectedTopic).toEqual(mockTopics[0]);
    expect(component.topics).toEqual(mockTopics[0].suggestions);
    expect(component.depthReached).toBe(false);

    component.selectTopic(mockTopics[0].suggestions[0]);

    expect(component.selectedTopic).toEqual(mockTopics[0].suggestions[0]);
    expect(component.topics).toEqual(mockTopics[0].suggestions[0].suggestions);
    expect(component.depthReached).toBe(false);

    component.goBack();

    expect(component.selectedTopic).toEqual(mockTopics[0]);
    expect(component.topics).toEqual(mockTopics[0].suggestions);
    expect(component.depthReached).toBe(false);

    component.goBack();

    expect(component.selectedTopic).toEqual(mockTopics[0]);
    expect(component.topics).toEqual(mockTopics[0].suggestions);
    expect(component.atFirstLevel).toBe(false);
  });

  it('should go back to the previous topic in history', () => {
    component.topics = mockTopics;
    component.selectTopic(mockTopics[0]);
    component.selectTopic(mockTopics[0].suggestions![0]);

    component.goBack();

    expect(component.selectedTopic).toBe(mockTopics[0]);
    expect(component.topics).toEqual(mockTopics[0].suggestions);
  });

  it('should reset the chat when "Start Again" is clicked', () => {
    component.getRepresentative();

    const reqRep = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/customer/available')
    );
    expect(reqRep.request.method).toBe('GET');
    reqRep.flush({ id: 1, name: 'Alice', isAvailable: true });

    const reqTopics = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/topics')
    );
    expect(reqTopics.request.method).toBe('GET');
    reqTopics.flush(mockTopics);

    expect(component.representativeName).toBe('Alice');
    expect(component.topics.length).toBeGreaterThan(0);

    component.startAgain();

    const reqStartAgainTopics = httpTestingController.expectOne((req) =>
      req.url.endsWith('/api/topics')
    );
    expect(reqStartAgainTopics.request.method).toBe('GET');
    reqStartAgainTopics.flush(mockTopics);

    expect(component.representativeName).toBeNull();
    expect(component.topics.length).toBeGreaterThan(0);
  });

  it('should show the "Go Back" button when not at first level', () => {
    component.topics = mockTopics;
    component.selectTopic(mockTopics[0]);

    expect(component.showBackButton()).toBe(true);
  });

  it('should not show the "Go Back" button at the first level', () => {
    expect(component.showBackButton()).toBe(false);
  });
});
