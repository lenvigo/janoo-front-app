import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VacationService } from './vacation.service';
import { environment } from '../../../environments/environment';
import { Vacation, CreateVacationDto } from '../models/vacation';
import { HttpErrorResponse } from '@angular/common/http';

describe('VacationService', () => {
  let service: VacationService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockVacation: Vacation = {
    id: '1',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    reason: 'Vacaciones familiares',
    status: 'PENDING' as const,
    requestedAt: '2024-02-20T10:00:00Z',
    user: '1',
  };

  const mockCreateVacationDto: CreateVacationDto = {
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    reason: 'Vacaciones familiares',
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VacationService,
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(VacationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createVacation', () => {
    it('should create a new vacation', () => {
      service.createVacation(mockCreateVacationDto).subscribe((vacation) => {
        expect(vacation).toEqual(mockVacation);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/vacations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateVacationDto);
      req.flush(mockVacation);
    });

    it('should handle duplicate vacation error', () => {
      service.createVacation(mockCreateVacationDto).subscribe({
        error: (error) => {
          expect(error).toBe(
            'Ya tienes una solicitud de vacaciones para estas fechas'
          );
          expect(toastrSpy.error).toHaveBeenCalledWith(
            'Ya tienes una solicitud de vacaciones para estas fechas',
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-top-center',
              closeButton: true,
            }
          );
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/vacations`);
      const errorResponse = new HttpErrorResponse({
        error: {
          message: 'You already have a vacation request for these dates',
          status: 400,
          error: true,
        },
        status: 400,
        statusText: 'Bad Request',
      });
      req.error(errorResponse.error);
    });
  });

  describe('approveVacation', () => {
    it('should approve a vacation', () => {
      const approvedVacation: Vacation = {
        ...mockVacation,
        status: 'APPROVED' as const,
      };

      service.approveVacation('1').subscribe((vacation) => {
        expect(vacation).toEqual(approvedVacation);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/vacations/1/approve`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(approvedVacation);
    });

    it('should handle unauthorized error when approving vacation', () => {
      service.approveVacation('1').subscribe({
        error: (error) => {
          expect(error).toBe(
            'Sesión expirada. Por favor, vuelva a iniciar sesión.'
          );
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/vacations/1/approve`
      );
      req.flush(
        {
          message: 'User not authenticated',
          status: 401,
          error: true,
        },
        {
          status: 401,
          statusText: 'Unauthorized',
        }
      );
    });
  });

  describe('rejectVacation', () => {
    it('should reject a vacation', () => {
      const rejectedVacation: Vacation = {
        ...mockVacation,
        status: 'REJECTED' as const,
      };

      service.rejectVacation('1').subscribe((vacation) => {
        expect(vacation).toEqual(rejectedVacation);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/vacations/1/reject`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(rejectedVacation);
    });

    it('should handle error when rejecting non-pending vacation', () => {
      service.rejectVacation('1').subscribe({
        error: (error) => {
          expect(error).toBe(
            'Solo las solicitudes pendientes pueden ser aprobadas/rechazadas'
          );
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/vacations/1/reject`
      );
      const errorResponse = new HttpErrorResponse({
        error: {
          message: 'Only pending requests can be approved/rejected',
          status: 400,
          error: true,
        },
        status: 400,
        statusText: 'Bad Request',
      });
      req.error(errorResponse.error);
    });
  });
});
