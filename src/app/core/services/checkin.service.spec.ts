import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CheckinService } from './checkin.service';
import { environment } from '../../../environments/environment';
import { Checkin } from '../models/checkin';
import { HttpErrorResponse } from '@angular/common/http';

describe('CheckinService', () => {
  let service: CheckinService;
  let httpMock: HttpTestingController;

  const mockCheckin: Checkin = {
    id: '1',
    user: 'user1',
    type: 'IN',
    timestamp: '2024-03-20T09:00:00.000Z',
  };

  const mockCheckins: Checkin[] = [
    {
      id: '1',
      user: 'user1',
      type: 'IN',
      timestamp: '2024-03-20T09:00:00.000Z',
    },
    {
      id: '2',
      user: 'user1',
      type: 'OUT',
      timestamp: '2024-03-20T18:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckinService],
    });

    service = TestBed.inject(CheckinService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a check-in', () => {
      service.create('IN').subscribe((checkin) => {
        expect(checkin).toEqual(mockCheckin);
        expect(checkin.timestamp).toBe(mockCheckin.timestamp);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins/in`);
      expect(req.request.method).toBe('POST');
      req.flush(mockCheckin);
    });

    it('should create a check-out', () => {
      const checkOut: Checkin = { ...mockCheckin, type: 'OUT' };

      service.create('OUT').subscribe((checkin) => {
        expect(checkin).toEqual(checkOut);
        expect(checkin.timestamp).toBe(checkOut.timestamp);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins/out`);
      expect(req.request.method).toBe('POST');
      req.flush(checkOut);
    });

    it('should handle error when creating check-in', () => {
      service.create('IN').subscribe({
        error: (error) => {
          expect(error.message).toBe('Ha ocurrido un error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins/in`);
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Ha ocurrido un error' },
        status: 500,
        statusText: 'Internal Server Error',
      });
      req.error(errorResponse.error);
    });
  });

  describe('listAll', () => {
    it('should get all checkins', () => {
      service.listAll().subscribe((checkins) => {
        expect(checkins).toEqual(mockCheckins);
        checkins.forEach((checkin) => {
          expect(checkin.timestamp).toBeDefined();
          expect(new Date(checkin.timestamp).toISOString()).toBe(
            checkin.timestamp
          );
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCheckins);
    });

    it('should handle error when getting all checkins', () => {
      service.listAll().subscribe({
        error: (error) => {
          expect(error.message).toBe('Ha ocurrido un error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Ha ocurrido un error' },
        status: 500,
        statusText: 'Internal Server Error',
      });
      req.error(errorResponse.error);
    });
  });

  describe('getUserCheckins', () => {
    it('should get checkins for a specific user', () => {
      const userId = 'user1';

      service.getUserCheckins(userId).subscribe((checkins) => {
        expect(checkins).toEqual(mockCheckins);
        checkins.forEach((checkin) => {
          expect(checkin.user).toBe(userId);
          expect(checkin.timestamp).toBeDefined();
          expect(new Date(checkin.timestamp).toISOString()).toBe(
            checkin.timestamp
          );
        });
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/checkins/user/${userId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCheckins);
    });

    it('should handle error when getting user checkins', () => {
      const userId = 'user1';

      service.getUserCheckins(userId).subscribe({
        error: (error) => {
          expect(error.message).toBe('Ha ocurrido un error');
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/checkins/user/${userId}`
      );
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Ha ocurrido un error' },
        status: 500,
        statusText: 'Internal Server Error',
      });
      req.error(errorResponse.error);
    });
  });

  describe('deleteCheckin', () => {
    it('should delete a checkin', () => {
      const checkinId = '1';

      service.deleteCheckin(checkinId).subscribe((checkin) => {
        expect(checkin).toEqual(mockCheckin);
        expect(checkin.timestamp).toBe(mockCheckin.timestamp);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/checkins/${checkinId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockCheckin);
    });

    it('should handle error when deleting checkin', () => {
      const checkinId = '1';

      service.deleteCheckin(checkinId).subscribe({
        error: (error) => {
          expect(error.message).toBe('Ha ocurrido un error');
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/checkins/${checkinId}`
      );
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Ha ocurrido un error' },
        status: 500,
        statusText: 'Internal Server Error',
      });
      req.error(errorResponse.error);
    });
  });
});
