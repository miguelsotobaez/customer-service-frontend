import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe('ChatService', () => {
  let service: ChatService;
  let httpTestingController: HttpTestingController;

  const mockRepresentative = { id: 1, name: 'Alice', isAvailable: true };
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ChatService],
    });

    service = TestBed.inject(ChatService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get available representative', () => {
    service.getAvailableRepresentative().subscribe((rep) => {
      expect(rep).toEqual(mockRepresentative);
    });

    // Verificar que la solicitud se haya hecho al endpoint correcto
    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/customer/available`
    );
    expect(req.request.method).toBe('GET');

    // Responder con los datos simulados
    req.flush(mockRepresentative);
  });

  it('should get topics', () => {
    service.getTopics().subscribe((topics) => {
      expect(topics).toEqual(mockTopics);
    });

    // Verificar que la solicitud se haya hecho al endpoint correcto
    const req = httpTestingController.expectOne(`${environment.apiUrl}/topics`);
    expect(req.request.method).toBe('GET');

    // Responder con los datos simulados
    req.flush(mockTopics);
  });

  it('should handle error when getting representative', () => {
    const consoleSpy = spyOn(console, 'error');

    service.getAvailableRepresentative().subscribe(
      () => fail('should have failed with the 500 error'),
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    // Simular un error en la solicitud
    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/customer/available`
    );
    req.flush('Service error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(consoleSpy).not.toHaveBeenCalled(); // No deberías manejar errores en el servicio en este caso
  });

  it('should handle error when getting topics', () => {
    const consoleSpy = spyOn(console, 'error');

    service.getTopics().subscribe(
      () => fail('should have failed with the 404 error'),
      (error) => {
        expect(error.status).toBe(404);
      }
    );

    // Simular un error en la solicitud
    const req = httpTestingController.expectOne(`${environment.apiUrl}/topics`);
    req.flush('Not Found', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(consoleSpy).not.toHaveBeenCalled(); // No deberías manejar errores en el servicio en este caso
  });
});
