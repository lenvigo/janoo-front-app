import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IncidentService } from './incident.service';
import { environment } from '../../../environments/environment';
import { Incident, CreateIncidentDto } from '../models/incident';
import { HttpErrorResponse } from '@angular/common/http';

describe('IncidentService', () => {
  let service: IncidentService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockIncident: Incident = {
    id: '1',
    user: 'user1',
    title: 'Test Incident',
    description: 'This is a test incident',
    status: 'OPEN',
    createdAt: '2024-03-20T09:00:00.000Z',
  };

  const mockIncidents: Incident[] = [
    {
      id: '1',
      user: 'user1',
      title: 'Test Incident 1',
      description: 'This is test incident 1',
      status: 'OPEN',
      createdAt: '2024-03-20T09:00:00.000Z',
    },
    {
      id: '2',
      user: 'user1',
      title: 'Test Incident 2',
      description: 'This is test incident 2',
      status: 'RESOLVED',
      createdAt: '2024-03-20T10:00:00.000Z',
      resolvedAt: '2024-03-20T11:00:00.000Z',
      managerId: 'manager1',
      managerComment: 'Issue resolved',
    },
  ];

  const mockCreateIncidentDto: CreateIncidentDto = {
    title: 'New Incident',
    description: 'This is a new incident',
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IncidentService,
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(IncidentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIncidents', () => {
    it('should get all incidents', () => {
      service.getIncidents().subscribe((incidents) => {
        expect(incidents).toEqual(mockIncidents);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/incidents`);
      expect(req.request.method).toBe('GET');
      req.flush(mockIncidents);
    });

    it('should handle error when getting incidents', () => {
      service.getIncidents().subscribe({
        error: (error) => {
          expect(error).toBe('Error interno del servidor');
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Error interno del servidor',
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-top-center',
              closeButton: true,
            }
          );
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/incidents`);
      req.flush(
        { message: 'Internal server error', status: 500, error: true },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('getUserIncidents', () => {
    it('should get incidents for a specific user', () => {
      const userId = 'user1';

      service.getUserIncidents(userId).subscribe((incidents) => {
        expect(incidents).toEqual(mockIncidents);
        incidents.forEach((incident) => {
          expect(incident.user).toBe(userId);
        });
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/incidents/user/${userId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockIncidents);
    });

    it('should handle error when getting user incidents', () => {
      const userId = 'user1';

      service.getUserIncidents(userId).subscribe({
        error: (error) => {
          expect(error).toBe('Error interno del servidor');
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Error interno del servidor',
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-top-center',
              closeButton: true,
            }
          );
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/incidents/user/${userId}`
      );
      req.flush(
        { message: 'Internal server error', status: 500, error: true },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('reportIncident', () => {
    it('should create a new incident', () => {
      service.reportIncident(mockCreateIncidentDto).subscribe((incident) => {
        expect(incident).toEqual(mockIncident);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/incidents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateIncidentDto);
      req.flush(mockIncident);
    });

    it('should handle error when creating incident', () => {
      service.reportIncident(mockCreateIncidentDto).subscribe({
        error: (error) => {
          expect(error).toBe('Error interno del servidor');
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Error interno del servidor',
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-top-center',
              closeButton: true,
            }
          );
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/incidents`);
      req.flush(
        { message: 'Internal server error', status: 500, error: true },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('resolveIncident', () => {
    it('should resolve an incident', () => {
      const incidentId = '1';
      const managerComment = 'Issue resolved';
      const resolvedIncident: Incident = {
        ...mockIncident,
        status: 'RESOLVED',
        resolvedAt: '2024-03-20T11:00:00.000Z',
        managerId: 'manager1',
        managerComment,
      };

      service
        .resolveIncident(incidentId, managerComment)
        .subscribe((incident) => {
          expect(incident).toEqual(resolvedIncident);
        });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/incidents/${incidentId}/resolve`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ managerComment });
      req.flush(resolvedIncident);
    });

    it('should handle unauthorized error when resolving incident', () => {
      const incidentId = '1';
      const managerComment = 'Issue resolved';

      service.resolveIncident(incidentId, managerComment).subscribe({
        error: (error) => {
          expect(error).toBe(
            'Sesión expirada. Por favor, vuelva a iniciar sesión.'
          );
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/incidents/${incidentId}/resolve`
      );
      req.flush(
        { message: 'User not authenticated', status: 401, error: true },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should handle manager permission error when resolving incident', () => {
      const incidentId = '1';
      const managerComment = 'Issue resolved';

      service.resolveIncident(incidentId, managerComment).subscribe({
        error: (error) => {
          expect(error).toBe('Solo los managers pueden resolver incidencias');
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/incidents/${incidentId}/resolve`
      );
      req.flush(
        {
          message: 'Only managers can resolve incidents',
          status: 403,
          error: true,
        },
        { status: 403, statusText: 'Forbidden' }
      );
    });
  });
});
